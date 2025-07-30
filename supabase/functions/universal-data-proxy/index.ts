import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataRequest {
  provider: 'fred' | 'glassnode' | 'binance' | 'coinbase' | 'polygon' | 'finnhub' | 'coingecko' | 'alpha-vantage' | 'yahoo-finance' | 'coindesk';
  endpoint?: string;
  symbol?: string;
  parameters?: Record<string, any>;
}

interface DataResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  provider: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

class UniversalDataProxy {
  private supabase;
  private rateLimits = new Map<string, { count: number; resetTime: number }>();

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async processRequest(request: DataRequest): Promise<DataResponse> {
    console.log(`Processing ${request.provider} request for ${request.endpoint}`);

    try {
      // Check rate limits
      if (this.isRateLimited(request.provider)) {
        throw new Error(`Rate limit exceeded for ${request.provider}`);
      }

      switch (request.provider) {
        case 'fred':
          return await this.handleFredRequest(request);
        case 'glassnode':
          return await this.handleGlassnodeRequest(request);
        case 'binance':
          return await this.handleBinanceRequest(request);
        case 'coinbase':
          return await this.handleCoinbaseRequest(request);
        case 'polygon':
          return await this.handlePolygonRequest(request);
        case 'finnhub':
          return await this.handleFinnhubRequest(request);
        case 'coingecko':
          return await this.handleCoinGeckoRequest(request);
        case 'alpha-vantage':
          return await this.handleAlphaVantageRequest(request);
        case 'yahoo-finance':
          return await this.handleYahooFinanceRequest(request);
        case 'coindesk':
          return await this.handleCoinDeskRequest(request);
        default:
          throw new Error(`Unsupported provider: ${request.provider}`);
      }
    } catch (error) {
      console.error(`Error processing ${request.provider} request:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        provider: request.provider
      };
    }
  }

  private async handleFredRequest(request: DataRequest): Promise<DataResponse> {
    const apiKey = Deno.env.get('FRED_API_KEY');
    if (!apiKey) {
      throw new Error('FRED API key not configured');
    }

    // Update rate limit tracking
    this.updateRateLimit('fred');

    const url = new URL('https://api.stlouisfed.org/fred/series/observations');
    url.searchParams.append('api_key', apiKey);
    url.searchParams.append('file_type', 'json');
    url.searchParams.append('limit', '10');
    url.searchParams.append('sort_order', 'desc');
    
    if (request.symbol) {
      url.searchParams.append('series_id', request.symbol);
    }

    // Add any additional parameters
    if (request.parameters) {
      Object.entries(request.parameters).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'LIQUIDITY2-Terminal/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        this.setRateLimited('fred', 60000); // 1 minute cooldown
        throw new Error('FRED API rate limit exceeded');
      }
      throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Store successful data in Supabase
    if (data.observations && data.observations.length > 0) {
      await this.storeIndicatorData('fred', request.symbol || 'unknown', data.observations);
    }

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      provider: 'fred',
      rateLimitInfo: this.getRateLimitInfo('fred')
    };
  }

  private async handleGlassnodeRequest(request: DataRequest): Promise<DataResponse> {
    const apiKey = Deno.env.get('GLASSNODE_API_KEY');
    if (!apiKey) {
      throw new Error('Glassnode API key not configured');
    }

    this.updateRateLimit('glassnode');

    const url = new URL(`https://api.glassnode.com/v1/metrics/${request.endpoint}`);
    url.searchParams.append('api_key', apiKey);
    url.searchParams.append('a', request.symbol || 'BTC');
    url.searchParams.append('f', 'JSON');

    if (request.parameters) {
      Object.entries(request.parameters).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 429) {
        this.setRateLimited('glassnode', 300000); // 5 minute cooldown
        throw new Error('Glassnode API rate limit exceeded');
      }
      throw new Error(`Glassnode API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      provider: 'glassnode',
      rateLimitInfo: this.getRateLimitInfo('glassnode')
    };
  }

  private async handleBinanceRequest(request: DataRequest): Promise<DataResponse> {
    this.updateRateLimit('binance');

    const baseUrl = 'https://api.binance.com';
    const url = `${baseUrl}${request.endpoint}`;

    const params = new URLSearchParams();
    if (request.symbol) {
      params.append('symbol', request.symbol);
    }
    if (request.parameters) {
      Object.entries(request.parameters).forEach(([key, value]) => {
        params.append(key, String(value));
      });
    }

    const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
    const response = await fetch(fullUrl);

    if (!response.ok) {
      if (response.status === 429) {
        this.setRateLimited('binance', 60000);
        throw new Error('Binance API rate limit exceeded');
      }
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      provider: 'binance',
      rateLimitInfo: this.getRateLimitInfo('binance')
    };
  }

  private async handleCoinbaseRequest(request: DataRequest): Promise<DataResponse> {
    this.updateRateLimit('coinbase');

    const baseUrl = 'https://api.exchange.coinbase.com';
    const url = `${baseUrl}${request.endpoint}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LIQUIDITY2-Terminal/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        this.setRateLimited('coinbase', 60000);
        throw new Error('Coinbase API rate limit exceeded');
      }
      throw new Error(`Coinbase API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      provider: 'coinbase',
      rateLimitInfo: this.getRateLimitInfo('coinbase')
    };
  }

  private async handlePolygonRequest(request: DataRequest): Promise<DataResponse> {
    const apiKey = Deno.env.get('POLYGON_API_KEY');
    if (!apiKey) {
      throw new Error('Polygon API key not configured');
    }

    this.updateRateLimit('polygon');

    const url = new URL(`https://api.polygon.io${request.endpoint}`);
    url.searchParams.append('apikey', apiKey);

    if (request.parameters) {
      Object.entries(request.parameters).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 429) {
        this.setRateLimited('polygon', 60000);
        throw new Error('Polygon API rate limit exceeded');
      }
      throw new Error(`Polygon API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      provider: 'polygon',
      rateLimitInfo: this.getRateLimitInfo('polygon')
    };
  }

  private async handleFinnhubRequest(request: DataRequest): Promise<DataResponse> {
    const apiKey = Deno.env.get('FINNHUB_KEY');
    if (!apiKey) {
      throw new Error('Finnhub API key not configured');
    }

    this.updateRateLimit('finnhub');

    const url = new URL(`https://finnhub.io/api/v1${request.endpoint}`);
    url.searchParams.append('token', apiKey);

    if (request.symbol) {
      url.searchParams.append('symbol', request.symbol);
    }

    if (request.parameters) {
      Object.entries(request.parameters).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 429) {
        this.setRateLimited('finnhub', 60000);
        throw new Error('Finnhub API rate limit exceeded');
      }
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      provider: 'finnhub',
      rateLimitInfo: this.getRateLimitInfo('finnhub')
    };
  }

  private async handleCoinGeckoRequest(request: DataRequest): Promise<DataResponse> {
    this.updateRateLimit('coingecko');

    // CoinGecko doesn't require API key for basic requests
    const symbol = request.symbol || 'bitcoin';
    const url = new URL(`https://api.coingecko.com/api/v3/simple/price`);
    url.searchParams.append('ids', symbol);
    url.searchParams.append('vs_currencies', 'usd');
    url.searchParams.append('include_market_cap', 'true');
    url.searchParams.append('include_24hr_change', 'true');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'LIQUIDITY2-Terminal/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        this.setRateLimited('coingecko', 60000);
        throw new Error('CoinGecko API rate limit exceeded');
      }
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      provider: 'coingecko',
      rateLimitInfo: this.getRateLimitInfo('coingecko')
    };
  }

  private async handleAlphaVantageRequest(request: DataRequest): Promise<DataResponse> {
    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    if (!apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    this.updateRateLimit('alpha-vantage');

    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.append('apikey', apiKey);
    
    if (request.symbol) {
      url.searchParams.append('symbol', request.symbol);
      url.searchParams.append('function', 'GLOBAL_QUOTE');
    }

    if (request.parameters) {
      Object.entries(request.parameters).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 429) {
        this.setRateLimited('alpha-vantage', 60000);
        throw new Error('Alpha Vantage API rate limit exceeded');
      }
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      provider: 'alpha-vantage',
      rateLimitInfo: this.getRateLimitInfo('alpha-vantage')
    };
  }

  private async handleYahooFinanceRequest(request: DataRequest): Promise<DataResponse> {
    this.updateRateLimit('yahoo-finance');

    // Using a public Yahoo Finance API endpoint
    const symbol = request.symbol || '^GSPC';
    const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
    url.searchParams.append('interval', '1d');
    url.searchParams.append('range', '1d');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'LIQUIDITY2-Terminal/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        this.setRateLimited('yahoo-finance', 300000); // 5 minute cooldown
        throw new Error('Yahoo Finance API rate limit exceeded');
      }
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      provider: 'yahoo-finance',
      rateLimitInfo: this.getRateLimitInfo('yahoo-finance')
    };
  }

  private async handleCoinDeskRequest(request: DataRequest): Promise<DataResponse> {
    this.updateRateLimit('coindesk');

    // CoinDesk Bitcoin Price Index (no API key required)
    const url = new URL('https://api.coindesk.com/v1/bpi/currentprice.json');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'LIQUIDITY2-Terminal/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        this.setRateLimited('coindesk', 60000);
        throw new Error('CoinDesk API rate limit exceeded');
      }
      throw new Error(`CoinDesk API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      provider: 'coindesk',
      rateLimitInfo: this.getRateLimitInfo('coindesk')
    };
  }

  private async storeIndicatorData(provider: string, symbol: string, observations: any[]) {
    try {
      // First, ensure the indicator exists
      const { data: indicator, error: indicatorError } = await this.supabase
        .from('indicators')
        .select('id')
        .eq('symbol', symbol)
        .eq('data_source', provider.toUpperCase())
        .single();

      if (indicatorError && indicatorError.code !== 'PGRST116') {
        console.error('Error checking indicator:', indicatorError);
        return;
      }

      let indicatorId = indicator?.id;

      if (!indicatorId) {
        // Create the indicator
        const { data: newIndicator, error: createError } = await this.supabase
          .from('indicators')
          .insert({
            symbol,
            data_source: provider.toUpperCase(),
            name: symbol,
            description: `${symbol} from ${provider}`,
            category: 'market',
            subcategory: 'general'
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating indicator:', createError);
          return;
        }

        indicatorId = newIndicator.id;
      }

      // Store the latest observation
      const latestObs = observations[0];
      if (latestObs && latestObs.value !== '.') {
        const { error: dataError } = await this.supabase
          .from('data_points')
          .insert({
            indicator_id: indicatorId,
            timestamp: latestObs.date + 'T00:00:00+00:00',
            value: parseFloat(latestObs.value),
            confidence_score: 1.0,
            raw_data: {
              ...latestObs,
              source: provider.toUpperCase()
            }
          });

        if (dataError) {
          console.error('Error storing data point:', dataError);
        }
      }
    } catch (error) {
      console.error('Error in storeIndicatorData:', error);
    }
  }

  private isRateLimited(provider: string): boolean {
    const limit = this.rateLimits.get(provider);
    if (!limit) return false;
    
    if (Date.now() > limit.resetTime) {
      this.rateLimits.delete(provider);
      return false;
    }
    
    return limit.count >= this.getProviderRateLimit(provider);
  }

  private updateRateLimit(provider: string): void {
    const now = Date.now();
    const limit = this.rateLimits.get(provider);
    
    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(provider, { count: 1, resetTime: now + 60000 });
    } else {
      limit.count++;
    }
  }

  private setRateLimited(provider: string, duration: number): void {
    this.rateLimits.set(provider, {
      count: 999,
      resetTime: Date.now() + duration
    });
  }

  private getProviderRateLimit(provider: string): number {
    const limits = {
      fred: 50,           // Conservative: 50 requests per minute
      glassnode: 30,      // Conservative: 30 requests per 10 minutes
      binance: 600,       // Conservative: 600 requests per minute
      coinbase: 5,        // Conservative: 5 requests per second
      polygon: 5,         // 5 requests per minute for free tier
      finnhub: 30,        // Conservative: 30 requests per minute
      coingecko: 50,      // 50 requests per minute for free tier
      'alpha-vantage': 5, // 5 requests per minute for free tier
      'yahoo-finance': 10, // Conservative: 10 requests per minute
      coindesk: 30        // 30 requests per minute (no official limit)
    };
    return limits[provider] || 30;
  }

  private getRateLimitInfo(provider: string) {
    const limit = this.rateLimits.get(provider);
    if (!limit) return { remaining: this.getProviderRateLimit(provider), resetTime: 0 };
    
    return {
      remaining: Math.max(0, this.getProviderRateLimit(provider) - limit.count),
      resetTime: limit.resetTime
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const proxy = new UniversalDataProxy();
    const result = await proxy.processRequest(body);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Universal data proxy error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      provider: 'unknown'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});