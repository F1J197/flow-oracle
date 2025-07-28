import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FinancialDataRequest {
  source: 'finnhub' | 'twelvedata' | 'fmp' | 'marketstack';
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

      default:
        throw new Error(`Unknown data source: ${source}`);
    }

    console.log(`Fetching data from: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    data = await response.json();
    console.log(`Successfully fetched ${source} data`);

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