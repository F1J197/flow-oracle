import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol, endpoint = '24hr' } = await req.json()
    
    if (!symbol) {
      throw new Error('Symbol is required')
    }

    let url: string
    if (endpoint === '24hr') {
      url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    } else if (endpoint === 'klines') {
      const { interval = '1d', limit = 100 } = await req.json()
      url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    } else {
      throw new Error('Invalid endpoint')
    }

    console.log(`Fetching from Binance: ${url}`)

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    console.log(`Binance API response:`, data)
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Binance proxy error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})