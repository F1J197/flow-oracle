import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { rateLimiters } from '../_shared/rate-limiter.ts';
import { RetryHandler } from '../_shared/retry-logic.ts';
import { globalAPIQueue } from '../_shared/api-queue.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FredApiResponse {
  observations: Array<{
    date: string;
    value: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { symbols } = await req.json();
    console.log('Processing FRED data ingestion for symbols:', symbols);

    const fredApiKey = Deno.env.get('FRED_API_KEY');
    if (!fredApiKey) {
      throw new Error('FRED_API_KEY environment variable is required');
    }

    const results = [];

    // Fetch indicators from database
    let indicatorsToProcess = [];
    if (symbols && symbols.length > 0) {
      const { data: indicators } = await supabaseClient
        .from('indicators')
        .select('*')
        .in('symbol', symbols)
        .eq('data_source', 'FRED')
        .eq('is_active', true);
      indicatorsToProcess = indicators || [];
    } else {
      // Process all active FRED indicators
      const { data: indicators } = await supabaseClient
        .from('indicators')
        .select('*')
        .eq('data_source', 'FRED')
        .eq('is_active', true)
        .order('priority', { ascending: true });
      indicatorsToProcess = indicators || [];
    }

    for (const indicator of indicatorsToProcess) {
      const startTime = Date.now();
      
      try {
        console.log(`Processing indicator: ${indicator.symbol}`);
        
        // Log ingestion start
        const { data: logEntry } = await supabaseClient
          .from('ingestion_logs')
          .insert({
            indicator_id: indicator.id,
            status: 'success',
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        // Fetch data from FRED API with enhanced rate limiting and fallback
        const seriesId = indicator.api_endpoint?.replace('/observations?series_id=', '') || indicator.symbol;
        const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredApiKey}&file_type=json&limit=100&sort_order=desc`;
        
        let data: FredApiResponse;
        
        try {
          const retryHandler = new RetryHandler({
            maxRetries: 2, // Reduced retries to avoid hitting rate limits
            initialDelay: 3000, // Increased delay
            maxDelay: 15000,
            backoffMultiplier: 2
          });
          
          data = await globalAPIQueue.enqueue(
            async () => {
              // Enhanced rate limiting - wait longer for FRED API
              await rateLimiters.fred.waitForToken();
              
              // Additional delay for FRED API
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Execute with enhanced retry logic
              return await retryHandler.executeWithRetry(async () => {
                const response = await fetch(fredUrl, {
                  method: 'GET',
                  headers: {
                    'User-Agent': 'LiquiditySquared/1.0',
                    'Accept': 'application/json'
                  }
                });
                
                if (!response.ok) {
                  if (response.status === 429) {
                    // Rate limited - wait longer and throw retryable error
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    const error = new Error(`FRED API rate limited: ${response.status}`) as any;
                    error.status = response.status;
                    error.retryable = true;
                    throw error;
                  }
                  
                  const error = new Error(`FRED API error: ${response.status} ${response.statusText}`) as any;
                  error.status = response.status;
                  error.retryable = response.status >= 500; // Only retry server errors
                  throw error;
                }

                const result = await response.json();
                return result;
              }, `fred-${indicator.symbol}`);
            },
            {
              priority: 1, // Lower priority to reduce pressure
              context: `fred-${indicator.symbol}`,
              maxRetries: 1 // Reduced retries at queue level
            }
          );
        } catch (error) {
          // Fallback to cached data if available
          const { data: cachedData } = await supabaseClient
            .from('data_points')
            .select('*')
            .eq('indicator_id', indicator.id)
            .order('timestamp', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (cachedData) {
            // Create mock response from cached data
            data = {
              observations: [{
                date: cachedData.timestamp.split('T')[0],
                value: cachedData.value.toString()
              }]
            };
          } else {
            // Skip this indicator if no cache available
            results.push({
              symbol: indicator.symbol,
              status: 'failed',
              error: `Rate limited and no cached data available: ${error.message}`,
              execution_time_ms: Date.now() - startTime
            });
            continue;
          }
        }
        let processedCount = 0;

        for (const observation of data.observations) {
          if (observation.value === '.' || !observation.value) continue;
          
          const value = parseFloat(observation.value);
          if (isNaN(value)) continue;

          // Check if data point already exists
          const { data: existing } = await supabaseClient
            .from('data_points')
            .select('id')
            .eq('indicator_id', indicator.id)
            .eq('timestamp', new Date(observation.date).toISOString())
            .maybeSingle();

          if (!existing) {
            // Insert new data point
            await supabaseClient
              .from('data_points')
              .insert({
                indicator_id: indicator.id,
                value: value,
                timestamp: new Date(observation.date).toISOString(),
                raw_data: observation,
                source_hash: `fred_${indicator.symbol}_${observation.date}`,
                confidence_score: 1.0
              });
            processedCount++;
          }
        }

        const executionTime = Date.now() - startTime;

        // Update ingestion log
        await supabaseClient
          .from('ingestion_logs')
          .update({
            status: 'success',
            records_processed: processedCount,
            execution_time_ms: executionTime,
            completed_at: new Date().toISOString()
          })
          .eq('id', logEntry.id);

        // Update indicator last_updated
        await supabaseClient
          .from('indicators')
          .update({
            last_updated: new Date().toISOString()
          })
          .eq('id', indicator.id);

        results.push({
          symbol: indicator.symbol,
          status: 'success',
          records_processed: processedCount,
          execution_time_ms: executionTime
        });

        console.log(`✅ ${indicator.symbol}: ${processedCount} records processed`);

      } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error(`❌ Error processing ${indicator.symbol}:`, error);

        // Log the error
        await supabaseClient
          .from('ingestion_logs')
          .insert({
            indicator_id: indicator.id,
            status: 'failed',
            error_message: error.message,
            execution_time_ms: executionTime,
            completed_at: new Date().toISOString()
          });

        results.push({
          symbol: indicator.symbol,
          status: 'failed',
          error: error.message,
          execution_time_ms: executionTime
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      total_indicators: results.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fred-data-ingestion function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});