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
    const { symbol, interval = '1day', outputsize = 30, endpoint = 'quote' } = await req.json()
    
    const apiKey = Deno.env.get('TWELVEDATA_KEY')
    if (!apiKey) {
      throw new Error('TWELVEDATA_KEY not configured')
    }

    let url: string
    if (endpoint === 'quote') {
      url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`
    } else if (endpoint === 'time_series') {
      url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${apiKey}`
    } else {
      throw new Error('Invalid endpoint')
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Twelve Data API error: ${response.status}`)
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