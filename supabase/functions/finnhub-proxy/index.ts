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
    const { symbol, endpoint = 'quote', base, quote = 'USD' } = await req.json()
    
    const apiToken = Deno.env.get('FINNHUB_KEY')
    if (!apiToken) {
      throw new Error('FINNHUB_KEY not configured')
    }

    let url: string
    if (endpoint === 'quote') {
      url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiToken}`
    } else if (endpoint === 'forex') {
      url = `https://finnhub.io/api/v1/forex/rates?base=${base}&token=${apiToken}`
    } else {
      throw new Error('Invalid endpoint')
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()
    
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