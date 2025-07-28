import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { rateLimiters } from '../_shared/rate-limiter.ts';
import { RetryHandler } from '../_shared/retry-logic.ts';
import { globalAPIQueue } from '../_shared/api-queue.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinancialDataRequest {
  source: 'finnhub' | 'twelvedata' | 'fmp' | 'marketstack' | 'polygon' | 'coingecko' | 'alphavantage';
  endpoint: string;
  symbol?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source, endpoint, symbol }: FinancialDataRequest = await req.json();
    console.log(`Processing ${source} data request for endpoint: ${endpoint}`);

    let data;
    let apiKey;
    let url;

    switch (source) {
      case 'finnhub':
        apiKey = Deno.env.get('FINNHUB_KEY');
        if (!apiKey) throw new Error('FINNHUB_KEY not found');
        
        switch (endpoint) {
          case 'crypto_price':
            url = `https://finnhub.io/api/v1/crypto/candle?symbol=BINANCE:BTCUSDT&resolution=1&from=${Math.floor(Date.now()/1000) - 86400}&to=${Math.floor(Date.now()/1000)}&token=${apiKey}`;
            break;
          case 'forex_rates':
            url = `https://finnhub.io/api/v1/forex/rates?base=USD&token=${apiKey}`;
            break;
          default:
            throw new Error(`Unknown Finnhub endpoint: ${endpoint}`);
        }
        break;

      case 'twelvedata':
        apiKey = Deno.env.get('TWELVEDATA_KEY');
        if (!apiKey) throw new Error('TWELVEDATA_KEY not found');
        
        switch (endpoint) {
          case 'crypto_price':
            url = `https://api.twelvedata.com/price?symbol=BTC/USD&apikey=${apiKey}`;
            break;
          case 'technical_indicators':
            url = `https://api.twelvedata.com/rsi?symbol=${symbol || 'BTC/USD'}&interval=1day&apikey=${apiKey}`;
            break;
          default:
            throw new Error(`Unknown Twelve Data endpoint: ${endpoint}`);
        }
        break;

      case 'fmp':
        apiKey = Deno.env.get('FMP_KEY');
        if (!apiKey) throw new Error('FMP_KEY not found');
        
        switch (endpoint) {
          case 'market_cap':
            url = `https://financialmodelingprep.com/api/v3/market-capitalization/AAPL?apikey=${apiKey}`;
            break;
          case 'economic_calendar':
            url = `https://financialmodelingprep.com/api/v3/economic_calendar?apikey=${apiKey}`;
            break;
          default:
            throw new Error(`Unknown FMP endpoint: ${endpoint}`);
        }
        break;

      case 'marketstack':
        apiKey = Deno.env.get('MARKETSTACK_KEY');
        if (!apiKey) throw new Error('MARKETSTACK_KEY not found');
        
        switch (endpoint) {
          case 'market_data':
            url = `http://api.marketstack.com/v1/eod/latest?access_key=${apiKey}&symbols=${symbol || 'AAPL'}`;
            break;
          default:
            throw new Error(`Unknown Marketstack endpoint: ${endpoint}`);
        }
        break;

      case 'polygon':
        apiKey = Deno.env.get('POLYGON_API_KEY');
        if (!apiKey) throw new Error('POLYGON_API_KEY not found');
        
        switch (endpoint) {
          case 'crypto_price':
            url = `https://api.polygon.io/v2/aggs/ticker/X:BTCUSD/prev?apikey=${apiKey}`;
            break;
          case 'stock_price':
            url = `https://api.polygon.io/v2/aggs/ticker/${symbol || 'AAPL'}/prev?apikey=${apiKey}`;
            break;
          case 'forex_rates':
            url = `https://api.polygon.io/v2/aggs/ticker/C:EURUSD/prev?apikey=${apiKey}`;
            break;
          default:
            throw new Error(`Unknown Polygon endpoint: ${endpoint}`);
        }
        break;

      case 'coingecko':
        apiKey = Deno.env.get('COINGECKO_API_KEY');
        if (!apiKey) throw new Error('COINGECKO_API_KEY not found');
        
        switch (endpoint) {
          case 'crypto_price':
            url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&x_cg_demo_api_key=${apiKey}`;
            break;
          case 'trending':
            url = `https://api.coingecko.com/api/v3/search/trending?x_cg_demo_api_key=${apiKey}`;
            break;
          case 'market_data':
            url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&x_cg_demo_api_key=${apiKey}`;
            break;
          default:
            throw new Error(`Unknown CoinGecko endpoint: ${endpoint}`);
        }
        break;

      case 'alphavantage':
        apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
        if (!apiKey) throw new Error('ALPHA_VANTAGE_API_KEY not found');
        
        switch (endpoint) {
          case 'crypto_price':
            url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=${apiKey}`;
            break;
          case 'technical_rsi':
            url = `https://www.alphavantage.co/query?function=RSI&symbol=${symbol || 'AAPL'}&interval=daily&time_period=14&series_type=close&apikey=${apiKey}`;
            break;
          case 'macd':
            url = `https://www.alphavantage.co/query?function=MACD&symbol=${symbol || 'AAPL'}&interval=daily&series_type=close&apikey=${apiKey}`;
            break;
          default:
            throw new Error(`Unknown Alpha Vantage endpoint: ${endpoint}`);
        }
        break;

      default:
        throw new Error(`Unknown data source: ${source}`);
    }

    // Get appropriate rate limiter and retry handler
    const rateLimiter = rateLimiters[source];
    const retryHandler = new RetryHandler();

    // Queue the API request with rate limiting and retry logic
    data = await globalAPIQueue.enqueue(
      async () => {
        // Wait for rate limit token
        await rateLimiter.waitForToken();
        
        // Execute with retry logic
        return await retryHandler.executeWithRetry(async () => {
          console.log(`Fetching data from: ${url}`);
          const response = await fetch(url);
          
          if (!response.ok) {
            const error = new Error(`API error: ${response.status} ${response.statusText}`) as any;
            error.status = response.status;
            throw error;
          }

          const result = await response.json();
          console.log(`Successfully fetched ${source} data`);
          return result;
        }, `${source}-${endpoint}`);
      },
      {
        priority: source === 'finnhub' ? 1 : 0, // Higher priority for rate-limited APIs
        context: `${source}-${endpoint}`,
        maxRetries: 3
      }
    );

    return new Response(JSON.stringify({
      success: true,
      source,
      endpoint,
      data,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in financial-data-ingestion function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});