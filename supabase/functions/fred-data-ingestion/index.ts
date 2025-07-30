import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FREDDataPoint {
  date: string;
  value: number;
}

interface FREDObservation {
  date: string;
  value: string;
}

interface FREDResponse {
  observations: FREDObservation[];
}

class FREDDataIngestion {
  private fredApiKey: string;
  private supabase: any;

  constructor() {
    this.fredApiKey = Deno.env.get('FRED_API_KEY') || '';
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
  }

  async fetchSeries(seriesId: string): Promise<FREDDataPoint[]> {
    try {
      console.log(`Fetching FRED series: ${seriesId}`);
      
      if (!this.fredApiKey) {
        throw new Error('FRED API key not configured');
      }

      const url = new URL('https://api.stlouisfed.org/fred/series/observations');
      url.searchParams.set('series_id', seriesId);
      url.searchParams.set('api_key', this.fredApiKey);
      url.searchParams.set('file_type', 'json');
      url.searchParams.set('limit', '1000');
      url.searchParams.set('sort_order', 'desc');
      url.searchParams.set('observation_start', '2020-01-01');

      console.log(`Making request to: ${url.toString()}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Liquidity2-Terminal/1.0',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`FRED API error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
      }

      const data: FREDResponse = await response.json();
      
      if (!data.observations || !Array.isArray(data.observations)) {
        console.error('Invalid FRED response format:', data);
        throw new Error('Invalid FRED API response format');
      }

      const processedData = data.observations
        .filter(obs => obs.value && obs.value !== '.' && obs.value !== 'null')
        .map(obs => ({
          date: obs.date,
          value: parseFloat(obs.value)
        }))
        .filter(obs => !isNaN(obs.value))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log(`Successfully processed ${processedData.length} observations for ${seriesId}`);

      // Store in database
      await this.storeIndicatorData('fred', seriesId, processedData);

      return processedData;
    } catch (error) {
      console.error(`Error fetching FRED series ${seriesId}:`, error);
      throw error;
    }
  }

  async fetchMultipleSeries(seriesIds: string[]): Promise<Record<string, FREDDataPoint[]>> {
    const results: Record<string, FREDDataPoint[]> = {};
    const errors: string[] = [];

    // Process in batches to respect rate limits
    const batchSize = 3;
    for (let i = 0; i < seriesIds.length; i += batchSize) {
      const batch = seriesIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (seriesId) => {
        try {
          const data = await this.fetchSeries(seriesId);
          results[seriesId] = data;
        } catch (error) {
          console.error(`Failed to fetch ${seriesId}:`, error);
          errors.push(`${seriesId}: ${error.message}`);
          results[seriesId] = [];
        }
      });

      await Promise.all(batchPromises);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < seriesIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (errors.length > 0) {
      console.warn(`Errors in batch fetch: ${errors.join(', ')}`);
    }

    return results;
  }

  private async storeIndicatorData(provider: string, symbol: string, observations: FREDDataPoint[]): Promise<void> {
    try {
      const dataPoints = observations.map(obs => ({
        provider,
        symbol,
        timestamp: new Date(obs.date).toISOString(),
        value: obs.value,
        metadata: { source: 'fred-data-ingestion' }
      }));

      const { error } = await this.supabase
        .from('indicator_data')
        .upsert(dataPoints, { 
          onConflict: 'provider,symbol,timestamp',
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('Error storing indicator data:', error);
      } else {
        console.log(`Stored ${dataPoints.length} data points for ${symbol}`);
      }
    } catch (error) {
      console.error('Error in storeIndicatorData:', error);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, seriesId, seriesIds } = await req.json();
    const fredService = new FREDDataIngestion();

    let result;
    
    switch (action) {
      case 'fetchSeries':
        if (!seriesId) {
          throw new Error('seriesId is required for fetchSeries action');
        }
        result = await fredService.fetchSeries(seriesId);
        break;
        
      case 'fetchMultipleSeries':
        if (!seriesIds || !Array.isArray(seriesIds)) {
          throw new Error('seriesIds array is required for fetchMultipleSeries action');
        }
        result = await fredService.fetchMultipleSeries(seriesIds);
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: result,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fred-data-ingestion function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});