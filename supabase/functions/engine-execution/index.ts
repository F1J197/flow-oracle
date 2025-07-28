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

    // Available engines
    const engines = [
      new NetLiquidityEngine(),
      new CreditStressEngine(),
      new MarketRegimeEngine()
    ];

    let enginesToRun = engines;

    // Filter engines based on request
    if (engineId) {
      enginesToRun = engines.filter(engine => engine.id === engineId);
      if (enginesToRun.length === 0) {
        throw new Error(`Engine not found: ${engineId}`);
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

        // Log execution to database
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