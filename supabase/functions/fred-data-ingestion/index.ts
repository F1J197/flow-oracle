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
  private cache = new Map<string, { data: FREDDataPoint[]; expiry: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor() {
    this.fredApiKey = Deno.env.get('FRED_API_KEY') || '';
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
  }

  async fetchSeries(seriesId: string, maxRetries: number = 3): Promise<FREDDataPoint[]> {
    // Check cache first to avoid unnecessary API calls
    const cached = await this.getCachedData(seriesId);
    if (cached) {
      console.log(`Using cached data for ${seriesId}`);
      return cached;
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Fetching FRED series: ${seriesId} (attempt ${attempt}/${maxRetries})`);
        
        // Enhanced validation: Check if this is an internal symbol that needs mapping
        const mappedSeriesId = this.mapSymbolToFREDSeries(seriesId);
        if (!mappedSeriesId) {
          console.warn(`Symbol ${seriesId} not available in FRED, skipping`);
          return [];
        }
        
        // Validate FRED series ID format (FRED requirement: 25 or less alphanumeric characters)
        if (!mappedSeriesId || mappedSeriesId.length > 25 || !/^[A-Za-z0-9_-]+$/.test(mappedSeriesId)) {
          throw new Error(`Invalid FRED series ID format: ${mappedSeriesId}. Must be 25 or less alphanumeric characters.`);
        }
        
        if (!this.fredApiKey) {
          throw new Error('FRED API key not configured');
        }

        const url = new URL('https://api.stlouisfed.org/fred/series/observations');
        url.searchParams.set('series_id', mappedSeriesId);
        url.searchParams.set('api_key', this.fredApiKey);
        url.searchParams.set('file_type', 'json');
        url.searchParams.set('limit', '1000');
        url.searchParams.set('sort_order', 'desc');
        url.searchParams.set('observation_start', '2020-01-01');

        console.log(`Making request to: ${url.toString()}`);

        // Add request delay to respect rate limits
        if (attempt > 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // Exponential backoff, max 30s
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'User-Agent': 'Liquidity2-Terminal/1.0',
          },
        });

        if (response.status === 429) {
          // Rate limited - check if we have more retries
          if (attempt < maxRetries) {
            const retryAfter = response.headers.get('retry-after');
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(5000 * attempt, 60000);
            console.warn(`Rate limited (429), retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            // Use cached data if available, even if expired
            const staleData = await this.getCachedData(seriesId, true);
            if (staleData) {
              console.log(`Using stale cached data for ${seriesId} due to rate limits`);
              return staleData;
            }
            throw new Error(`FRED API rate limit exceeded after ${maxRetries} attempts`);
          }
        }

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

        console.log(`Successfully processed ${processedData.length} observations for ${mappedSeriesId}`);

        // Cache the data before storing
        await this.setCachedData(seriesId, processedData);

        // Store in database using original symbol for consistency
        await this.storeIndicatorData('fred', seriesId, processedData);

        return processedData;

      } catch (error) {
        if (attempt === maxRetries) {
          console.error(`Final attempt failed for FRED series ${seriesId}:`, error);
          // Try to return cached data as last resort
          const staleData = await this.getCachedData(seriesId, true);
          if (staleData) {
            console.log(`Using stale cached data for ${seriesId} as fallback`);
            return staleData;
          }
          throw error;
        }
        console.warn(`Attempt ${attempt} failed for ${seriesId}, retrying...`, error);
      }
    }
    
    // This should not be reached due to the logic above, but included for safety
    throw new Error(`Failed to fetch ${seriesId} after ${maxRetries} attempts`);
  }

  async fetchMultipleSeries(seriesIds: string[]): Promise<Record<string, FREDDataPoint[]>> {
    const results: Record<string, FREDDataPoint[]> = {};
    const errors: string[] = [];

    // Check cache first for all series
    const uncachedIds: string[] = [];
    for (const seriesId of seriesIds) {
      const cached = await this.getCachedData(seriesId);
      if (cached) {
        results[seriesId] = cached;
        console.log(`Using cached data for ${seriesId}`);
      } else {
        uncachedIds.push(seriesId);
      }
    }

    if (uncachedIds.length === 0) {
      return results;
    }

    // Process uncached series sequentially to avoid rate limits
    console.log(`Processing ${uncachedIds.length} uncached series sequentially`);
    for (const seriesId of uncachedIds) {
      try {
        // Add delay between requests to be very conservative
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        const data = await this.fetchSeries(seriesId);
        results[seriesId] = data;
      } catch (error) {
        console.error(`Failed to fetch ${seriesId}:`, error);
        errors.push(`${seriesId}: ${error.message}`);
        
        // Try to get stale cached data as fallback
        const staleData = await this.getCachedData(seriesId, true);
        if (staleData) {
          console.log(`Using stale cached data for ${seriesId} as fallback`);
          results[seriesId] = staleData;
        } else {
          results[seriesId] = [];
        }
      }
    }

    if (errors.length > 0) {
      console.warn(`Errors in series fetch: ${errors.join(', ')}`);
    }

    return results;
  }

  private mapSymbolToFREDSeries(internalSymbol: string): string | null {
    // FRED Symbol Mapping - matches fredSymbolMapping.ts
    const FRED_SYMBOL_MAP: Record<string, string | null> = {
      // Credit & Interest Rates
      'credit-stress-score': 'NFCI',
      'high-yield-spread': 'BAMLH0A0HYM2',
      'investment-grade-spread': 'BAMLC0A0CM',
      'vix': 'VIXCLS',
      
      // Federal Reserve Data
      'fed-balance-sheet': 'WALCL',
      'treasury-account': 'WTREGEN',
      'reverse-repo': 'RRPONTSYD',
      'net-liquidity': 'WALCL',
      
      // Market Data
      'spx': 'SP500',
      'dxy': 'DEXUSEU',
      'yields-10y': 'DGS10',
      'yields-2y': 'DGS2',
      
      // Crypto (Not available in FRED)
      'btc-price': null,
      'btc-market-cap': null,
      
      // Economic Indicators
      'unemployment': 'UNRATE',
      'inflation': 'CPIAUCSL',
      'gdp': 'GDP',
      'money-supply': 'M2SL',
      
      // Dealer Positions & Repo
      'primary-dealer-positions': 'PDCMPY',
      'repo-rates': 'SOFR'
    };

    // Check if symbol is already a FRED series ID
    if (/^[A-Z0-9_-]{1,25}$/.test(internalSymbol) && !FRED_SYMBOL_MAP[internalSymbol]) {
      return internalSymbol; // Already a FRED series ID
    }

    // Map internal symbol to FRED series ID
    return FRED_SYMBOL_MAP[internalSymbol] || null;
  }

  private async getCachedData(seriesId: string, allowStale: boolean = false): Promise<FREDDataPoint[] | null> {
    const cached = this.cache.get(seriesId);
    if (cached && (allowStale || cached.expiry > Date.now())) {
      return cached.data;
    }
    return null;
  }

  private async setCachedData(seriesId: string, data: FREDDataPoint[]): Promise<void> {
    this.cache.set(seriesId, {
      data,
      expiry: Date.now() + this.CACHE_TTL
    });
  }

  private async storeIndicatorData(provider: string, symbol: string, observations: FREDDataPoint[]): Promise<void> {
    try {
      const dataPoints = observations.map(obs => ({
        provider,
        symbol,
        timestamp: new Date(obs.date).toISOString(),
        value: obs.value, // Fixed: Use 'value' instead of 'current_value' 
        metadata: { 
          source: 'fred-data-ingestion',
          mapped_series: this.mapSymbolToFREDSeries(symbol)
        }
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
    const requestBody = await req.json();
    const fredService = new FREDDataIngestion();

    let result;
    
    // Handle both new format (with action) and legacy format (with series)
    if (requestBody.action) {
      // New format
      const { action, seriesId, seriesIds } = requestBody;
      
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
    } else if (requestBody.series) {
      // Legacy format - single series fetch
      const { series } = requestBody;
      console.log(`Processing legacy format request for series: ${series}`);
      result = await fredService.fetchSeries(series);
    } else {
      throw new Error('Invalid request format. Expected either action/seriesId or series field');
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