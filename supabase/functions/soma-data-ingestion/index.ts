import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { RetryHandler } from '../_shared/retry-logic.ts';
import { rateLimiters } from '../_shared/rate-limiter.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const fredApiKey = Deno.env.get('FRED_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const retryHandler = new RetryHandler({ maxRetries: 3, initialDelay: 2000 });

interface SOMAHolding {
  cusip: string;
  security_description: string;
  maturity_date: string;
  par_amount: number;
  market_value: number;
  weighted_average_maturity: number;
  sector: string;
  issue_date: string;
  coupon_rate: number;
  holdings_date: string;
  change_from_previous: number;
}

interface NYFedSOMAResponse {
  holdings: SOMAHolding[];
  report_date: string;
  total_par_value: number;
  total_market_value: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting SOMA data ingestion...');
    const startTime = Date.now();

    // Phase 1: Fetch NY Fed SOMA holdings data
    const somaData = await fetchNYFedSOMAData();
    console.log(`Fetched ${somaData.holdings.length} SOMA holdings`);

    // Phase 2: Process and validate data
    const processedHoldings = await processSOMAHoldings(somaData.holdings);
    console.log(`Processed ${processedHoldings.length} valid holdings`);

    // Phase 3: Store in database with conflict resolution
    const storedCount = await storeSOMAHoldings(processedHoldings);
    console.log(`Stored ${storedCount} holdings in database`);

    // Phase 4: Detect anomalies in new data
    const anomalies = await detectHoldingsAnomalies(processedHoldings);
    console.log(`Detected ${anomalies.length} potential anomalies`);

    // Phase 5: Store anomaly results
    if (anomalies.length > 0) {
      await storeAnomalies(anomalies);
    }

    // Phase 6: Update H.4.1 validation
    await updateH41Validation(somaData);

    const executionTime = Date.now() - startTime;
    console.log(`SOMA ingestion completed in ${executionTime}ms`);

    return new Response(JSON.stringify({
      success: true,
      holdings_processed: storedCount,
      anomalies_detected: anomalies.length,
      execution_time_ms: executionTime,
      report_date: somaData.report_date
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('SOMA ingestion failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function fetchNYFedSOMAData(): Promise<NYFedSOMAResponse> {
  await rateLimiters.nyFed.waitForToken();
  
  return await retryHandler.executeWithRetry(async () => {
    // NY Fed SOMA holdings endpoint
    const response = await fetch(
      'https://markets.newyorkfed.org/api/soma/summary.json',
      {
        headers: {
          'User-Agent': 'Liquidity2-Platform/1.0',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`NY Fed API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform NY Fed format to our internal format
    const holdings: SOMAHolding[] = data.soma.holdings.map((holding: any) => ({
      cusip: holding.cusip,
      security_description: holding.securityDesc,
      maturity_date: holding.maturityDate,
      par_amount: parseFloat(holding.parValue || '0'),
      market_value: parseFloat(holding.marketValue || '0'),
      weighted_average_maturity: parseFloat(holding.weightedAverageMaturity || '0'),
      sector: holding.sector || 'Treasury',
      issue_date: holding.issueDate,
      coupon_rate: parseFloat(holding.couponRate || '0'),
      holdings_date: data.asOfDate,
      change_from_previous: parseFloat(holding.changeFromPrevious || '0')
    }));

    return {
      holdings,
      report_date: data.asOfDate,
      total_par_value: data.totalParValue,
      total_market_value: data.totalMarketValue
    };
  }, 'NY Fed SOMA fetch');
}

async function processSOMAHoldings(holdings: SOMAHolding[]): Promise<SOMAHolding[]> {
  const processed: SOMAHolding[] = [];
  
  for (const holding of holdings) {
    // Data validation and cleaning
    if (!holding.cusip || holding.cusip.length !== 9) {
      console.warn(`Invalid CUSIP: ${holding.cusip}`);
      continue;
    }

    // Ensure CUSIP metadata exists
    await ensureCUSIPMetadata(holding);
    
    processed.push(holding);
  }
  
  return processed;
}

async function ensureCUSIPMetadata(holding: SOMAHolding): Promise<void> {
  const { data: existingMetadata } = await supabase
    .from('cusip_metadata')
    .select('id')
    .eq('cusip_id', holding.cusip)
    .single();

  if (!existingMetadata) {
    // Calculate maturity bucket
    const maturityDate = new Date(holding.maturity_date);
    const today = new Date();
    const yearsToMaturity = (maturityDate.getTime() - today.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    let maturityBucket = '10Y+';
    if (yearsToMaturity <= 1) maturityBucket = '0-1Y';
    else if (yearsToMaturity <= 3) maturityBucket = '1-3Y';
    else if (yearsToMaturity <= 5) maturityBucket = '3-5Y';
    else if (yearsToMaturity <= 10) maturityBucket = '5-10Y';

    const { error } = await supabase
      .from('cusip_metadata')
      .insert({
        cusip_id: holding.cusip,
        security_type: holding.sector || 'Treasury',
        issuer: 'US Treasury',
        maturity_bucket: maturityBucket,
        duration: holding.weighted_average_maturity,
        liquidity_tier: 1,
        on_the_run: false
      });

    if (error) {
      console.error(`Failed to create CUSIP metadata for ${holding.cusip}:`, error);
    }
  }
}

async function storeSOMAHoldings(holdings: SOMAHolding[]): Promise<number> {
  let storedCount = 0;
  
  // Batch insert in chunks of 100
  const chunkSize = 100;
  for (let i = 0; i < holdings.length; i += chunkSize) {
    const chunk = holdings.slice(i, i + chunkSize);
    
    const { error } = await supabase
      .from('soma_holdings')
      .upsert(
        chunk.map(holding => ({
          cusip_id: holding.cusip,
          security_description: holding.security_description,
          maturity_date: holding.maturity_date,
          par_amount: holding.par_amount,
          market_value: holding.market_value,
          weighted_average_maturity: holding.weighted_average_maturity,
          sector: holding.sector,
          issue_date: holding.issue_date,
          coupon_rate: holding.coupon_rate,
          holdings_date: holding.holdings_date,
          change_from_previous: holding.change_from_previous
        })),
        { 
          onConflict: 'cusip_id,holdings_date',
          ignoreDuplicates: false 
        }
      );

    if (error) {
      console.error(`Failed to store SOMA holdings chunk ${i}:`, error);
    } else {
      storedCount += chunk.length;
    }
  }
  
  return storedCount;
}

async function detectHoldingsAnomalies(holdings: SOMAHolding[]): Promise<any[]> {
  const anomalies: any[] = [];
  
  for (const holding of holdings) {
    // Anomaly 1: Unusual change in holdings
    if (Math.abs(holding.change_from_previous) > 1000000000) { // $1B threshold
      anomalies.push({
        cusip_id: holding.cusip,
        anomaly_type: 'holdings',
        severity_score: Math.min(100, Math.abs(holding.change_from_previous) / 10000000), // Scale to 0-100
        confidence_level: 85.0,
        detection_method: 'statistical_outlier',
        raw_features: {
          change_amount: holding.change_from_previous,
          par_amount: holding.par_amount,
          security_type: holding.sector
        },
        anomaly_details: {
          description: `Unusual holdings change of $${(holding.change_from_previous / 1000000).toFixed(1)}M`,
          threshold_exceeded: '$1B',
          risk_level: holding.change_from_previous > 0 ? 'accumulation' : 'reduction'
        }
      });
    }

    // Anomaly 2: Maturity concentration risk
    const maturityDate = new Date(holding.maturity_date);
    const daysToMaturity = (maturityDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    
    if (daysToMaturity < 30 && holding.par_amount > 5000000000) { // $5B in <30 days
      anomalies.push({
        cusip_id: holding.cusip,
        anomaly_type: 'maturity',
        severity_score: 75.0,
        confidence_level: 90.0,
        detection_method: 'rule_based',
        raw_features: {
          days_to_maturity: daysToMaturity,
          par_amount: holding.par_amount
        },
        anomaly_details: {
          description: `Large holding maturing in ${Math.round(daysToMaturity)} days`,
          risk_type: 'rollover_risk',
          amount_at_risk: holding.par_amount
        }
      });
    }
  }
  
  return anomalies;
}

async function storeAnomalies(anomalies: any[]): Promise<void> {
  const { error } = await supabase
    .from('cusip_anomalies')
    .insert(anomalies);

  if (error) {
    console.error('Failed to store anomalies:', error);
    throw new Error(`Anomaly storage failed: ${error.message}`);
  }
}

async function updateH41Validation(somaData: NYFedSOMAResponse): Promise<void> {
  // Fetch latest H.4.1 data for validation
  if (!fredApiKey) {
    console.warn('FRED API key not available, skipping H.4.1 validation');
    return;
  }

  await rateLimiters.fred.waitForToken();
  
  try {
    const h41Response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=WALCL&api_key=${fredApiKey}&file_type=json&limit=1&sort_order=desc`
    );
    
    if (h41Response.ok) {
      const h41Data = await h41Response.json();
      const latestH41 = h41Data.observations[0];
      
      const variance = Math.abs(parseFloat(latestH41.value) * 1000000 - somaData.total_market_value);
      
      await supabase
        .from('h41_validation')
        .insert({
          report_date: somaData.report_date,
          securities_held_outright: somaData.total_market_value,
          total_assets: parseFloat(latestH41.value) * 1000000,
          variance_from_soma: variance,
          reconciliation_status: variance < 50000000000 ? 'reconciled' : 'variance_detected' // $50B threshold
        });
    }
  } catch (error) {
    console.error('H.4.1 validation failed:', error);
  }
}