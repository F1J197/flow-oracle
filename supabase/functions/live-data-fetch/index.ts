import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fredApiKey = Deno.env.get('FRED_API_KEY')
    if (!fredApiKey) {
      throw new Error('FRED_API_KEY not configured')
    }

    const { symbols } = await req.json()
    const results = []

    for (const symbol of symbols || ['WALCL', 'WTREGEN', 'RRPONTSYD', 'BAMLH0A0HYM2', 'DGS10']) {
      try {
        console.log(`Fetching live data for ${symbol}`)
        
        // Fetch from FRED API
        const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${symbol}&api_key=${fredApiKey}&file_type=json&limit=1&sort_order=desc&observation_start=2020-01-01`
        
        const fredResponse = await fetch(fredUrl)
        const fredData = await fredResponse.json()
        
        if (fredData.observations && fredData.observations.length > 0) {
          const latestObs = fredData.observations[0]
          const value = parseFloat(latestObs.value)
          
          if (!isNaN(value)) {
            // Get indicator ID
            const { data: indicator } = await supabase
              .from('indicators')
              .select('id')
              .eq('symbol', symbol)
              .eq('data_source', 'FRED')
              .single()
            
            if (indicator) {
              // Insert new data point
              const { error: insertError } = await supabase
                .from('data_points')
                .insert({
                  indicator_id: indicator.id,
                  value: value,
                  timestamp: new Date(latestObs.date).toISOString(),
                  confidence_score: 1.0,
                  raw_data: {
                    source: 'FRED_API',
                    series_id: symbol,
                    date: latestObs.date,
                    realtime_start: fredData.realtime_start,
                    realtime_end: fredData.realtime_end
                  }
                })
              
              if (!insertError) {
                // Update indicator last_updated
                await supabase
                  .from('indicators')
                  .update({ last_updated: new Date().toISOString() })
                  .eq('id', indicator.id)
                
                results.push({
                  symbol,
                  value,
                  timestamp: latestObs.date,
                  success: true
                })
              } else {
                console.error(`Insert error for ${symbol}:`, insertError)
                results.push({
                  symbol,
                  error: insertError.message,
                  success: false
                })
              }
            } else {
              results.push({
                symbol,
                error: 'Indicator not found in database',
                success: false
              })
            }
          } else {
            results.push({
              symbol,
              error: 'Invalid value from FRED API',
              success: false
            })
          }
        } else {
          results.push({
            symbol,
            error: 'No observations returned from FRED API',
            success: false
          })
        }
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error)
        results.push({
          symbol,
          error: error.message,
          success: false
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        updated_at: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Live data fetch error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})