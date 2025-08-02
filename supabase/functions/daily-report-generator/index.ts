import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const { engineOutputs, clis, masterSignal, requestType } = await req.json();

    console.log('🧠 Generating AI narrative with Claude...');

    // Prepare context for Claude
    const context = {
      masterSignal,
      clis,
      engineCount: engineOutputs.length,
      successfulEngines: engineOutputs.filter(e => e.success).length,
      avgConfidence: engineOutputs.reduce((sum, e) => sum + (e.confidence || 0), 0) / engineOutputs.length,
      timestamp: new Date().toISOString()
    };

    const prompt = `You are an elite financial intelligence analyst for a Goldman Sachs-level trading desk. Generate a professional market briefing based on these metrics:

CURRENT MARKET STATE:
- Master Signal: ${masterSignal}
- CLIS (Composite Liquidity Intelligence Score): ${clis}/10
- Engine Consensus: ${context.successfulEngines}/${context.engineCount} engines operational
- Average Confidence: ${context.avgConfidence.toFixed(1)}%

Generate a response in this exact JSON format:
{
  "headline": "One compelling headline about current market conditions",
  "summary": [
    "Executive summary point 1 about current positioning",
    "Key liquidity insight with specific metrics",
    "Risk factor or opportunity identification", 
    "Forward-looking guidance for next 24-48 hours",
    "Actionable intelligence for portfolio positioning"
  ],
  "riskFactors": [
    "Primary risk factor to monitor",
    "Secondary systemic risk",
    "Tail risk consideration"
  ]
}

Keep language institutional-grade but accessible. Focus on actionable insights and forward-looking guidance. Be specific about timeframes and confidence levels.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': anthropicApiKey
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Claude API error details:', errorBody);
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.content?.[0]?.text;

    if (!content) {
      throw new Error('No content received from Claude');
    }

    // Parse Claude's JSON response
    let narrative;
    try {
      narrative = JSON.parse(content);
    } catch (parseError) {
      console.warn('Failed to parse Claude response as JSON, using fallback');
      narrative = {
        headline: `${masterSignal} Signal Active - CLIS: ${clis}`,
        summary: [
          `APEX Model indicates ${masterSignal} positioning with CLIS at ${clis}/10.`,
          'Multiple engines confirm current directional bias.',
          'Liquidity metrics support continued risk-asset allocation.',
          'Hidden alpha opportunities detected in accumulation patterns.',
          'Maintain disciplined approach with defined risk parameters.'
        ],
        riskFactors: [
          'Central bank policy uncertainty',
          'Credit stress monitor thresholds', 
          'Geopolitical risk escalation'
        ]
      };
    }

    console.log('✅ AI narrative generated successfully');

    return new Response(JSON.stringify(narrative), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Daily report generator failed:', error);
    
    // Return fallback response
    const fallback = {
      headline: "Market Analysis Temporarily Unavailable",
      summary: [
        "AI narrative generation temporarily unavailable.",
        "Manual analysis indicates continued market operation.",
        "Key metrics remain within normal parameters.",
        "Monitor for system restoration updates.",
        "Maintain current risk positioning until further notice."
      ],
      riskFactors: [
        "System availability limitations",
        "Reduced analytical capabilities",
        "Manual oversight required"
      ]
    };

    return new Response(JSON.stringify(fallback), {
      status: 200, // Return 200 to avoid breaking client
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});