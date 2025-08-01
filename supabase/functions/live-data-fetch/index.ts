// Real-time Market Data Fetching Service
// Orchestrates all external API calls for market indicators

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Core indicators configuration
    const indicators = [
      // Fed Data (FRED)
      { symbol: 'WALCL', source: 'FRED', endpoint: 'fred', priority: 1 },
      { symbol: 'WTREGEN', source: 'FRED', endpoint: 'fred', priority: 1 },
      { symbol: 'RRPONTSYD', source: 'FRED', endpoint: 'fred', priority: 1 },
      { symbol: 'DGS10', source: 'FRED', endpoint: 'fred', priority: 2 },
      { symbol: 'BAMLH0A0HYM2', source: 'FRED', endpoint: 'fred', priority: 1 },
      { symbol: 'BAMLC0A0CM', source: 'FRED', endpoint: 'fred', priority: 1 },
      
      // Market Data (Multiple sources)
      { symbol: 'VIX', source: 'TWELVE_DATA', endpoint: 'twelve-data', priority: 1 },
      { symbol: 'VIX9D', source: 'TWELVE_DATA', endpoint: 'twelve-data', priority: 1 },
      { symbol: 'MOVE', source: 'TWELVE_DATA', endpoint: 'twelve-data', priority: 2 },
      { symbol: 'SPX', source: 'TWELVE_DATA', endpoint: 'twelve-data', priority: 1 },
      { symbol: 'NDX', source: 'TWELVE_DATA', endpoint: 'twelve-data', priority: 1 },
      { symbol: 'DXY', source: 'TWELVE_DATA', endpoint: 'twelve-data', priority: 2 },
      
      // Crypto Data
      { symbol: 'BTCUSD', source: 'COINBASE', endpoint: 'coinbase', priority: 1 },
      { symbol: 'ETHUSD', source: 'COINBASE', endpoint: 'coinbase', priority: 2 },
      
      // Commodities
      { symbol: 'GOLD', source: 'TWELVE_DATA', endpoint: 'twelve-data', priority: 2 },
    ];

    const results = [];
    const errors = [];

    console.log(`Starting data fetch for ${indicators.length} indicators`);

    // Fetch data in parallel by priority groups
    const priorityGroups = {
      1: indicators.filter(i => i.priority === 1),
      2: indicators.filter(i => i.priority === 2)
    };

    // Process Priority 1 indicators first (critical)
    for (const indicator of priorityGroups[1]) {
      try {
        const result = await fetchIndicatorData(indicator);
        if (result.success) {
          // Insert into market_indicators table
          const { error: insertError } = await supabase
            .from('market_indicators')
            .insert({
              symbol: indicator.symbol,
              source: indicator.source,
              value: result.value,
              timestamp: new Date().toISOString(),
              metadata: result.metadata || {}
            });

          if (insertError) {
            console.error(`Insert error for ${indicator.symbol}:`, insertError);
            errors.push({ symbol: indicator.symbol, error: insertError.message });
          } else {
            results.push({ symbol: indicator.symbol, value: result.value, source: indicator.source });
            console.log(`✓ Successfully updated ${indicator.symbol}: ${result.value}`);
          }
        } else {
          errors.push({ symbol: indicator.symbol, error: result.error });
        }
      } catch (error) {
        console.error(`Error fetching ${indicator.symbol}:`, error);
        errors.push({ symbol: indicator.symbol, error: error.message });
      }
    }

    // Process Priority 2 indicators (important but not critical)
    for (const indicator of priorityGroups[2]) {
      try {
        const result = await fetchIndicatorData(indicator);
        if (result.success) {
          const { error: insertError } = await supabase
            .from('market_indicators')
            .insert({
              symbol: indicator.symbol,
              source: indicator.source,
              value: result.value,
              timestamp: new Date().toISOString(),
              metadata: result.metadata || {}
            });

          if (insertError) {
            console.error(`Insert error for ${indicator.symbol}:`, insertError);
            errors.push({ symbol: indicator.symbol, error: insertError.message });
          } else {
            results.push({ symbol: indicator.symbol, value: result.value, source: indicator.source });
            console.log(`✓ Successfully updated ${indicator.symbol}: ${result.value}`);
          }
        } else {
          errors.push({ symbol: indicator.symbol, error: result.error });
        }
      } catch (error) {
        console.error(`Error fetching ${indicator.symbol}:`, error);
        errors.push({ symbol: indicator.symbol, error: error.message });
      }
    }

    // Trigger engine calculations after data update
    try {
      const { data: engineResult, error: engineError } = await supabase.functions.invoke('engine-execution', {
        body: { trigger: 'data_update', indicators_updated: results.length }
      });

      if (engineError) {
        console.error('Engine execution error:', engineError);
        errors.push({ system: 'engine-execution', error: engineError.message });
      } else {
        console.log('✓ Engine calculations triggered successfully');
      }
    } catch (error) {
      console.error('Engine trigger error:', error);
      errors.push({ system: 'engine-execution', error: error.message });
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      indicators_updated: results.length,
      indicators_failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('Live data fetch completed:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Live data fetch failed:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Individual indicator data fetching
async function fetchIndicatorData(indicator: any) {
  try {
    switch (indicator.endpoint) {
      case 'fred':
        return await fetchFromFRED(indicator.symbol);
      case 'twelve-data':
        return await fetchFromTwelveData(indicator.symbol);
      case 'coinbase':
        return await fetchFromCoinbase(indicator.symbol);
      default:
        return { success: false, error: 'Unknown endpoint' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function fetchFromFRED(symbol: string) {
  try {
    const fredApiKey = Deno.env.get('FRED_API_KEY');
    if (!fredApiKey) {
      throw new Error('FRED_API_KEY not configured');
    }

    const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${symbol}&api_key=${fredApiKey}&file_type=json&limit=1&sort_order=desc&observation_start=2020-01-01`;
    
    const response = await fetch(fredUrl);
    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.observations && data.observations.length > 0) {
      const latest = data.observations[0];
      const value = parseFloat(latest.value);
      
      if (!isNaN(value)) {
        return { 
          success: true, 
          value,
          metadata: { source: 'FRED', last_updated: latest.date }
        };
      } else {
        return { success: false, error: 'Invalid value from FRED' };
      }
    } else {
      return { success: false, error: 'No data returned from FRED' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function fetchFromTwelveData(symbol: string) {
  try {
    const apiKey = Deno.env.get('TWELVEDATA_KEY');
    if (!apiKey) {
      throw new Error('TWELVEDATA_KEY not configured');
    }

    const url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Twelve Data API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.price) {
      return { 
        success: true, 
        value: parseFloat(data.price),
        metadata: { source: 'TWELVE_DATA', timestamp: new Date().toISOString() }
      };
    } else {
      return { success: false, error: 'No price data returned from Twelve Data' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function fetchFromCoinbase(symbol: string) {
  try {
    // Use Coinbase Pro API
    const url = `https://api.exchange.coinbase.com/products/${symbol}/ticker`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Coinbase API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.price) {
      return { 
        success: true, 
        value: parseFloat(data.price),
        metadata: { source: 'COINBASE', timestamp: data.time }
      };
    } else {
      return { success: false, error: 'No price data returned from Coinbase' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}