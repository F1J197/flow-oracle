import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestResult {
  component: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action } = await req.json().catch(() => ({ action: 'test_all' }));
    console.log('🧪 System Orchestration Test - Action:', action);

    const results: TestResult[] = [];

    // Test 1: Data Orchestrator
    console.log('🔍 Testing Data Orchestrator...');
    try {
      const { data: dataResult, error: dataError } = await supabaseClient.functions.invoke('data-orchestrator', {
        body: { action: 'ingest' }
      });

      if (dataError) {
        results.push({
          component: 'Data Orchestrator',
          status: 'error',
          message: `Failed: ${dataError.message}`,
          details: dataError
        });
      } else {
        results.push({
          component: 'Data Orchestrator',
          status: 'success',
          message: `Successfully processed ${dataResult?.indicatorsProcessed || 0} indicators`,
          details: dataResult
        });
      }
    } catch (error) {
      results.push({
        component: 'Data Orchestrator',
        status: 'error',
        message: `Exception: ${error.message}`,
        details: error
      });
    }

    // Small delay to ensure data is available
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Engine Orchestrator
    console.log('🔍 Testing Engine Orchestrator...');
    try {
      const { data: engineResult, error: engineError } = await supabaseClient.functions.invoke('engine-orchestrator', {
        body: { action: 'orchestrate', forceExecution: true }
      });

      if (engineError) {
        results.push({
          component: 'Engine Orchestrator',
          status: 'error',
          message: `Failed: ${engineError.message}`,
          details: engineError
        });
      } else {
        results.push({
          component: 'Engine Orchestrator',
          status: 'success',
          message: `Successfully executed ${engineResult?.enginesExecuted || 0} engines with CLIS: ${engineResult?.clis || 'N/A'}`,
          details: engineResult
        });
      }
    } catch (error) {
      results.push({
        component: 'Engine Orchestrator',
        status: 'error',
        message: `Exception: ${error.message}`,
        details: error
      });
    }

    // Test 3: Daily Report Generator
    console.log('🔍 Testing Daily Report Generator...');
    try {
      const { data: reportResult, error: reportError } = await supabaseClient.functions.invoke('daily-report-generator', {
        body: { requestType: 'narrative' }
      });

      if (reportError) {
        results.push({
          component: 'Daily Report Generator',
          status: 'error',
          message: `Failed: ${reportError.message}`,
          details: reportError
        });
      } else {
        results.push({
          component: 'Daily Report Generator',
          status: 'success',
          message: `Successfully generated report: ${reportResult?.headline || 'No headline'}`,
          details: reportResult
        });
      }
    } catch (error) {
      results.push({
        component: 'Daily Report Generator',
        status: 'error',
        message: `Exception: ${error.message}`,
        details: error
      });
    }

    // Test 4: Check Database State
    console.log('🔍 Checking Database State...');
    try {
      // Check market indicators
      const { data: indicators, error: indicatorsError } = await supabaseClient
        .from('market_indicators')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (indicatorsError) {
        results.push({
          component: 'Market Indicators',
          status: 'error',
          message: `Database error: ${indicatorsError.message}`,
          details: indicatorsError
        });
      } else {
        results.push({
          component: 'Market Indicators',
          status: indicators && indicators.length > 0 ? 'success' : 'warning',
          message: `Found ${indicators?.length || 0} recent indicators`,
          details: indicators
        });
      }

      // Check engine outputs
      const { data: outputs, error: outputsError } = await supabaseClient
        .from('engine_outputs')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(5);

      if (outputsError) {
        results.push({
          component: 'Engine Outputs',
          status: 'error',
          message: `Database error: ${outputsError.message}`,
          details: outputsError
        });
      } else {
        results.push({
          component: 'Engine Outputs',
          status: outputs && outputs.length > 0 ? 'success' : 'warning',
          message: `Found ${outputs?.length || 0} recent engine outputs`,
          details: outputs
        });
      }

      // Check master signals
      const { data: signals, error: signalsError } = await supabaseClient
        .from('master_signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (signalsError) {
        results.push({
          component: 'Master Signals',
          status: 'error',
          message: `Database error: ${signalsError.message}`,
          details: signalsError
        });
      } else {
        results.push({
          component: 'Master Signals',
          status: signals && signals.length > 0 ? 'success' : 'warning',
          message: `Found ${signals?.length || 0} recent master signals`,
          details: signals
        });
      }

    } catch (error) {
      results.push({
        component: 'Database Check',
        status: 'error',
        message: `Exception: ${error.message}`,
        details: error
      });
    }

    // Test 5: Check Cron Jobs
    console.log('🔍 Checking Cron Jobs...');
    try {
      const { data: cronJobs, error: cronError } = await supabaseClient.rpc('get_active_cron_jobs');

      if (cronError) {
        results.push({
          component: 'Cron Jobs',
          status: 'error',
          message: `Failed to check cron jobs: ${cronError.message}`,
          details: cronError
        });
      } else {
        const orchestrationJobs = cronJobs?.filter((job: any) => 
          job.jobname.includes('data-orchestration') || 
          job.jobname.includes('engine-orchestration') ||
          job.jobname.includes('daily-intelligence-reports')
        ) || [];

        results.push({
          component: 'Cron Jobs',
          status: orchestrationJobs.length >= 3 ? 'success' : 'warning',
          message: `Found ${orchestrationJobs.length}/3 expected cron jobs`,
          details: orchestrationJobs
        });
      }
    } catch (error) {
      results.push({
        component: 'Cron Jobs',
        status: 'error',
        message: `Exception: ${error.message}`,
        details: error
      });
    }

    // Summary
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;

    const overallStatus = errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'success';

    console.log(`🎯 System Test Complete: ${successCount} success, ${warningCount} warnings, ${errorCount} errors`);

    return new Response(JSON.stringify({
      success: overallStatus === 'success',
      overallStatus,
      summary: {
        total: results.length,
        success: successCount,
        warnings: warningCount,
        errors: errorCount
      },
      results,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ System test failed:', error);
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