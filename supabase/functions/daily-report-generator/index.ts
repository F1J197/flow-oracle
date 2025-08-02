import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface DailyReport {
  id: string;
  date: string;
  executiveSummary: string;
  marketMetrics: {
    btcPrediction: {
      target: number;
      confidence: number;
      timeframe: string;
    };
    sp500Outlook: string;
    vixForecast: string;
    dollarStrength: string;
  };
  forwardGuidance: string[];
  hiddenAlpha: string[];
  earlyWarningRadar: string[];
  positioningRecommendations: string[];
  engineInsights: Array<{
    engineName: string;
    signal: string;
    confidence: number;
    insight: string;
  }>;
  createdAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting daily report generation...');

    // Fetch latest engine outputs
    const { data: engineOutputs, error: engineError } = await supabase
      .from('engine_outputs')
      .select('*')
      .order('calculated_at', { ascending: false })
      .limit(100);

    if (engineError) {
      console.error('Engine outputs fetch error:', engineError);
      throw engineError;
    }

    // Fetch latest market indicators
    const { data: marketData, error: marketError } = await supabase
      .from('market_indicators')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (marketError) {
      console.error('Market data fetch error:', marketError);
      throw marketError;
    }

    // Group engine outputs by engine_id (latest only)
    const latestEngineOutputs = new Map();
    engineOutputs?.forEach(output => {
      if (!latestEngineOutputs.has(output.engine_id)) {
        latestEngineOutputs.set(output.engine_id, output);
      }
    });

    // Prepare data summary for AI analysis
    const engineSummary = Array.from(latestEngineOutputs.values()).map(output => ({
      engine: output.engine_id,
      signal: output.signal,
      confidence: output.confidence,
      primaryValue: output.primary_value,
      analysis: output.analysis
    }));

    const marketSummary = marketData?.slice(0, 10).map(indicator => ({
      symbol: indicator.symbol,
      value: indicator.value,
      timestamp: indicator.timestamp
    }));

    // Generate AI-powered insights using Perplexity
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    const analysisPrompt = `
As a senior macro strategist, analyze these financial engine outputs and market data to create a comprehensive daily report:

ENGINE OUTPUTS:
${JSON.stringify(engineSummary, null, 2)}

MARKET DATA:
${JSON.stringify(marketSummary, null, 2)}

Generate a structured analysis with:
1. Executive Summary (2-3 sentences)
2. BTC Price Prediction (specific target, confidence %, timeframe)
3. Forward Guidance (3-4 key themes)
4. Hidden Alpha (2-3 contrarian insights)
5. Early Warning Radar (potential risks)
6. Positioning Recommendations (specific actions)

Be data-driven, concise, and actionable. Focus on what institutional investors need to know.
`;

    console.log('📊 Sending analysis request to Perplexity...');

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a senior macro strategist and financial analyst. Provide structured, actionable insights based on quantitative data.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'day'
      }),
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    const aiAnalysis = perplexityData.choices[0].message.content;

    console.log('🤖 AI analysis completed');

    // Parse AI response and structure the report
    const report: DailyReport = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      executiveSummary: extractSection(aiAnalysis, 'Executive Summary', 'BTC Price Prediction'),
      marketMetrics: {
        btcPrediction: parseBTCPrediction(aiAnalysis),
        sp500Outlook: extractSection(aiAnalysis, 'S&P 500', 'VIX') || 'Monitoring',
        vixForecast: extractSection(aiAnalysis, 'VIX', 'Dollar') || 'Stable',
        dollarStrength: extractSection(aiAnalysis, 'Dollar', 'Forward') || 'Neutral'
      },
      forwardGuidance: extractBulletPoints(aiAnalysis, 'Forward Guidance'),
      hiddenAlpha: extractBulletPoints(aiAnalysis, 'Hidden Alpha'),
      earlyWarningRadar: extractBulletPoints(aiAnalysis, 'Early Warning'),
      positioningRecommendations: extractBulletPoints(aiAnalysis, 'Positioning'),
      engineInsights: engineSummary.slice(0, 8).map(engine => ({
        engineName: engine.engine,
        signal: engine.signal,
        confidence: engine.confidence,
        insight: engine.analysis || 'No analysis available'
      })),
      createdAt: new Date().toISOString()
    };

    // Store the report in database
    const { data: savedReport, error: saveError } = await supabase
      .from('daily_reports')
      .insert([{
        report_id: report.id,
        report_date: report.date,
        content: report,
        created_at: report.createdAt
      }])
      .select()
      .single();

    if (saveError) {
      console.error('Save error:', saveError);
      // Continue anyway, return the report even if save fails
    } else {
      console.log('✅ Report saved to database');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      report,
      message: 'Daily report generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Daily report generation failed:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions for parsing AI response
function extractSection(text: string, startMarker: string, endMarker?: string): string {
  const startIndex = text.toLowerCase().indexOf(startMarker.toLowerCase());
  if (startIndex === -1) return '';
  
  let endIndex = text.length;
  if (endMarker) {
    const endIdx = text.toLowerCase().indexOf(endMarker.toLowerCase(), startIndex + startMarker.length);
    if (endIdx !== -1) endIndex = endIdx;
  }
  
  return text.slice(startIndex + startMarker.length, endIndex)
    .trim()
    .replace(/^\d+\.\s*/, '')
    .replace(/^[:-]\s*/, '');
}

function extractBulletPoints(text: string, section: string): string[] {
  const sectionText = extractSection(text, section);
  return sectionText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && (line.includes('-') || line.includes('•') || line.includes('*')))
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(line => line.length > 10)
    .slice(0, 4);
}

function parseBTCPrediction(text: string): { target: number; confidence: number; timeframe: string } {
  const btcSection = extractSection(text, 'BTC', 'Forward').toLowerCase();
  
  // Extract target price
  const priceMatch = btcSection.match(/\$?(\d{1,3}[,\d]*)/);
  const target = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0;
  
  // Extract confidence
  const confMatch = btcSection.match(/(\d{1,3})%/);
  const confidence = confMatch ? parseInt(confMatch[1]) : 50;
  
  // Extract timeframe
  let timeframe = '7 days';
  if (btcSection.includes('week')) timeframe = '1 week';
  else if (btcSection.includes('month')) timeframe = '1 month';
  else if (btcSection.includes('quarter')) timeframe = '3 months';
  
  return { target, confidence, timeframe };
}