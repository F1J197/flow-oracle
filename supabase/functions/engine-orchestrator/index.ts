import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EngineOrchestrationResult {
  success: boolean;
  enginesExecuted: number;
  engineResults: any[];
  masterSignal: string;
  clis: number;
  executionTimeMs: number;
  timestamp: string;
  errors: string[];
}

// Engine execution order by priority and dependencies
const ENGINE_EXECUTION_ORDER = [
  // Foundation Layer (Priority 1-3)
  'DIS',           // Data Integrity Engine
  'ZS_COMP',       // Z-Score Composite Engine
  'ENHANCED_MOMENTUM', // Enhanced Momentum Engine
  
  // Core Analysis (Priority 4-6)
  'NET_LIQ',       // Net Liquidity Engine  
  'CREDIT_STRESS', // Credit Stress Engine
  'market-regime', // Market Regime Engine
  
  // Advanced Analytics (Priority 7-10)
  'DEALER_POSITIONS', // Dealer Positions Engine
  'DEALER_LEVERAGE',  // Dealer Leverage Engine
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, forceExecution } = await req.json().catch(() => ({ action: 'orchestrate' }));
    console.log('🎛️ Engine Orchestrator - Processing action:', action);

    if (action === 'health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        availableEngines: ENGINE_EXECUTION_ORDER.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if we have recent data (within last 10 minutes)
    if (!forceExecution) {
      const { data: recentData, error: dataCheckError } = await supabaseClient
        .from('market_indicators')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
        .limit(1);

      if (dataCheckError || !recentData || recentData.length === 0) {
        console.log('⚠️ No recent market data found, triggering data ingestion first...');
        
        const { error: ingestionError } = await supabaseClient.functions.invoke('data-orchestrator', {
          body: { action: 'ingest' }
        });

        if (ingestionError) {
          throw new Error(`Data ingestion failed: ${ingestionError.message}`);
        }
      }
    }

    // Execute the full engine orchestration
    const result = await executeEngineOrchestration(supabaseClient);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Engine Orchestrator error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function executeEngineOrchestration(supabaseClient: any): Promise<EngineOrchestrationResult> {
  const startTime = Date.now();
  const result: EngineOrchestrationResult = {
    success: true,
    enginesExecuted: 0,
    engineResults: [],
    masterSignal: 'NEUTRAL',
    clis: 5.0,
    executionTimeMs: 0,
    timestamp: new Date().toISOString(),
    errors: []
  };

  console.log('🚀 Starting engine orchestration for', ENGINE_EXECUTION_ORDER.length, 'engines...');

  // Execute engines in order
  for (const engineId of ENGINE_EXECUTION_ORDER) {
    try {
      console.log(`⚡ Executing engine: ${engineId}`);
      
      const { data: engineResult, error: engineError } = await supabaseClient.functions.invoke('engine-execution', {
        body: { 
          engineId: engineId,
          priority: 'high'
        }
      });

      if (engineError) {
        console.error(`❌ Engine ${engineId} failed:`, engineError);
        result.errors.push(`${engineId}: ${engineError.message}`);
        continue;
      }

      if (engineResult && engineResult.results && engineResult.results.length > 0) {
        const engineOutput = engineResult.results[0];
        result.engineResults.push(engineOutput);
        result.enginesExecuted++;
        
        console.log(`✅ Engine ${engineId} executed successfully - Signal: ${engineOutput.signal}, Confidence: ${engineOutput.confidence}`);
      } else {
        console.warn(`⚠️ Engine ${engineId} returned no results`);
        result.errors.push(`${engineId}: No results returned`);
      }

    } catch (error) {
      console.error(`❌ Engine ${engineId} execution error:`, error);
      result.errors.push(`${engineId}: ${error.message}`);
    }

    // Small delay between engines to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Calculate master signal and CLIS based on engine results
  const signalAnalysis = calculateMasterSignal(result.engineResults);
  result.masterSignal = signalAnalysis.signal;
  result.clis = signalAnalysis.clis;

  // Store master signal
  try {
    const { error: signalError } = await supabaseClient
      .from('master_signals')
      .insert({
        master_signal: result.masterSignal,
        signal_strength: Math.round(signalAnalysis.strength * 100),
        consensus_score: Math.round(signalAnalysis.consensus * 100),
        regime_confidence: Math.round(signalAnalysis.confidence * 100),
        market_regime: signalAnalysis.regime,
        conflict_level: signalAnalysis.conflict,
        engine_count: result.enginesExecuted
      });

    if (signalError) {
      console.error('❌ Failed to store master signal:', signalError);
      result.errors.push(`Master signal storage error: ${signalError.message}`);
    } else {
      console.log(`✅ Master signal stored: ${result.masterSignal} (CLIS: ${result.clis})`);
    }
  } catch (error) {
    console.error('❌ Master signal storage failed:', error);
    result.errors.push(`Master signal error: ${error.message}`);
  }

  // Log orchestration performance
  result.executionTimeMs = Date.now() - startTime;
  
  try {
    await supabaseClient
      .from('system_health_metrics')
      .insert([
        {
          component: 'engine_orchestrator',
          metric_name: 'engines_executed',
          metric_value: result.enginesExecuted,
          metric_unit: 'count'
        },
        {
          component: 'engine_orchestrator', 
          metric_name: 'execution_time',
          metric_value: result.executionTimeMs,
          metric_unit: 'milliseconds'
        },
        {
          component: 'engine_orchestrator',
          metric_name: 'clis_score',
          metric_value: result.clis,
          metric_unit: 'score'
        }
      ]);
  } catch (error) {
    console.error('❌ Failed to log performance metrics:', error);
  }

  console.log(`🎯 Engine orchestration completed: ${result.enginesExecuted}/${ENGINE_EXECUTION_ORDER.length} engines executed in ${result.executionTimeMs}ms`);
  
  return result;
}

function calculateMasterSignal(engineResults: any[]): {
  signal: string;
  clis: number;
  strength: number;
  consensus: number;
  confidence: number;
  regime: string;
  conflict: string;
} {
  if (engineResults.length === 0) {
    return {
      signal: 'NEUTRAL',
      clis: 5.0,
      strength: 0.5,
      consensus: 0.5,
      confidence: 0.5,
      regime: 'UNKNOWN',
      conflict: 'HIGH'
    };
  }

  // Count signals
  const signalCounts = { bullish: 0, bearish: 0, neutral: 0 };
  let totalConfidence = 0;
  let totalValue = 0;

  engineResults.forEach(result => {
    const signal = result.signal?.toLowerCase() || 'neutral';
    if (signal.includes('bullish') || signal === 'risk_on') {
      signalCounts.bullish++;
    } else if (signal.includes('bearish') || signal === 'risk_off') {
      signalCounts.bearish++;
    } else {
      signalCounts.neutral++;
    }
    
    totalConfidence += result.confidence || 0.5;
    totalValue += result.primary_value || 0;
  });

  const totalSignals = engineResults.length;
  const avgConfidence = totalConfidence / totalSignals;
  
  // Determine master signal
  let masterSignal = 'NEUTRAL';
  let strength = 0.5;
  
  if (signalCounts.bullish > signalCounts.bearish + signalCounts.neutral) {
    masterSignal = 'RISK_ON';
    strength = signalCounts.bullish / totalSignals;
  } else if (signalCounts.bearish > signalCounts.bullish + signalCounts.neutral) {
    masterSignal = 'RISK_OFF'; 
    strength = signalCounts.bearish / totalSignals;
  } else {
    masterSignal = 'NEUTRAL';
    strength = signalCounts.neutral / totalSignals;
  }

  // Calculate CLIS (Composite Liquidity Intelligence Score)
  const clis = Math.max(1, Math.min(10, 5 + (totalValue / totalSignals) * 2));
  
  // Calculate consensus
  const maxSignals = Math.max(signalCounts.bullish, signalCounts.bearish, signalCounts.neutral);
  const consensus = maxSignals / totalSignals;
  
  // Determine regime and conflict level
  const regime = clis > 7 ? 'EXPANSION' : clis < 3 ? 'CONTRACTION' : 'TRANSITION';
  const conflict = consensus > 0.7 ? 'LOW' : consensus > 0.5 ? 'MEDIUM' : 'HIGH';

  return {
    signal: masterSignal,
    clis: Math.round(clis * 10) / 10,
    strength,
    consensus,
    confidence: avgConfidence,
    regime,
    conflict
  };
}