import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EngineExecutionRequest {
  engineId?: string;
  pillar?: number;
  priority?: 'high' | 'normal' | 'low';
}

interface EngineResult {
  engineId: string;
  success: boolean;
  confidence: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  data: any;
  executionTime: number;
  timestamp: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { engineId, pillar, priority = 'normal' }: EngineExecutionRequest = await req.json();
    console.log('Processing engine execution request:', { engineId, pillar, priority });

    // Import engines dynamically
    const { NetLiquidityEngine } = await import('../_shared/engines/net-liquidity-engine.ts');
    const { CreditStressEngine } = await import('../_shared/engines/credit-stress-engine.ts');
    const { MarketRegimeEngine } = await import('../_shared/engines/market-regime-engine.ts');
    const { DataIntegrityEngine } = await import('../_shared/engines/data-integrity-engine.ts');
    const { EnhancedMomentumEngine } = await import('../_shared/engines/enhanced-momentum-engine.ts');
    const { ZScoreCompositeEngine } = await import('../_shared/engines/zscore-composite-engine.ts');
    const { DealerPositionsEngine } = await import('../_shared/engines/dealer-positions-engine.ts');
    const { DealerLeverageEngine } = await import('../_shared/engines/dealer-leverage-engine.ts');

    // Available engines
    const engines = [
      new NetLiquidityEngine(),
      new CreditStressEngine(),
      new MarketRegimeEngine(),
      new DataIntegrityEngine(),
      new EnhancedMomentumEngine(),
      new ZScoreCompositeEngine(),
      new DealerPositionsEngine(),
      new DealerLeverageEngine()
    ];

    let enginesToRun = engines;

    // Engine ID mapping for legacy compatibility
    const engineIdMap: Record<string, string> = {
      'DIS': 'DIS',
      'data-integrity': 'DIS',
      'data-integrity-v6': 'DIS',
      'NET_LIQ': 'NET_LIQ',
      'CREDIT_STRESS': 'CREDIT_STRESS',
      'ENHANCED_MOMENTUM': 'ENHANCED_MOMENTUM',
      'ZS_COMP': 'ZS_COMP',
      'DEALER_POSITIONS': 'DEALER_POSITIONS',
      'DEALER_LEVERAGE': 'DEALER_LEVERAGE'
    };

    // Filter engines based on request
    if (engineId) {
      const mappedId = engineIdMap[engineId] || engineId;
      enginesToRun = engines.filter(engine => engine.id === mappedId);
      if (enginesToRun.length === 0) {
        throw new Error(`Engine not found: ${engineId} (mapped to: ${mappedId})`);
      }
    } else if (pillar !== undefined) {
      enginesToRun = engines.filter(engine => engine.pillar === pillar);
    }

    // Sort by priority
    enginesToRun.sort((a, b) => a.priority - b.priority);

    const results: EngineResult[] = [];

    // Execute engines
    for (const engine of enginesToRun) {
      const startTime = Date.now();
      
      try {
        console.log(`Executing engine: ${engine.name}`);
        
        const result = await engine.execute();
        const executionTime = Date.now() - startTime;

        results.push({
          engineId: engine.id,
          success: result.success,
          confidence: result.confidence,
          signal: result.signal,
          data: result.data,
          executionTime,
          timestamp: new Date().toISOString(),
        });

        // Log execution to engine_executions table
        await supabaseClient
          .from('engine_executions')
          .insert({
            engine_id: engine.id,
            execution_time_ms: executionTime,
            success: result.success,
            confidence: result.confidence,
            signal: result.signal,
            result_data: result.data,
          });

        // Also log to engine_outputs table for compatibility
        await supabaseClient
          .from('engine_outputs')
          .insert({
            engine_id: engine.id,
            primary_value: result.data?.primaryValue || 0,
            confidence: Math.round(result.confidence * 100),
            signal: result.signal,
            pillar: engine.pillar,
            analysis: result.data?.analysis || `${engine.name} executed successfully`,
            sub_metrics: result.data || {},
            alerts: result.data?.alerts || [],
            calculated_at: new Date().toISOString()
          });

        console.log(`✅ Engine ${engine.name} executed successfully in ${executionTime}ms`);

      } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error(`❌ Engine ${engine.name} failed:`, error);

        results.push({
          engineId: engine.id,
          success: false,
          confidence: 0,
          signal: 'neutral',
          data: null,
          executionTime,
          timestamp: new Date().toISOString(),
          error: error.message
        });

        // Log failed execution
        await supabaseClient
          .from('engine_executions')
          .insert({
            engine_id: engine.id,
            execution_time_ms: executionTime,
            success: false,
            confidence: 0,
            signal: 'neutral',
            error_message: error.message,
          });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      totalEngines: results.length,
      executedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in engine-execution function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});