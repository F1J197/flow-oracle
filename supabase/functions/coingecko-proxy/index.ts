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
    const { ids, endpoint = 'simple/price', vs_currencies = 'usd', include_24hr_change = 'true' } = await req.json()
    
    if (!ids) {
      throw new Error('Coin IDs are required')
    }

    let url: string
    if (endpoint === 'simple/price') {
      url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}&include_24hr_change=${include_24hr_change}&include_market_cap=true&include_last_updated_at=true`
    } else if (endpoint === 'coins/market_chart') {
      const { days = 30, vs_currency = 'usd' } = await req.json()
      url = `https://api.coingecko.com/api/v3/coins/${ids}/market_chart?vs_currency=${vs_currency}&days=${days}`
    } else {
      throw new Error('Invalid endpoint')
    }

    console.log(`Fetching from CoinGecko: ${url}`)

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    console.log(`CoinGecko API response:`, data)
    
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
    console.error('CoinGecko proxy error:', error)
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