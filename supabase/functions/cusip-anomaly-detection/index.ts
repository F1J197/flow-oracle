import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DBSCANPoint {
  cusip_id: string;
  features: number[];
  cluster?: number;
  isNoise?: boolean;
  anomalyScore?: number;
}

interface AnomalyResult {
  cusip_id: string;
  anomaly_type: string;
  severity_score: number;
  confidence_level: number;
  detection_method: string;
  raw_features: any;
  anomaly_details: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting advanced CUSIP anomaly detection...');
    const startTime = Date.now();

    const { algorithm = 'dbscan', lookbackDays = 30 } = await req.json().catch(() => ({}));

    // Phase 3: Advanced ML-based anomaly detection
    const anomalies = await runAnomalyDetection(algorithm, lookbackDays);
    console.log(`Detected ${anomalies.length} anomalies using ${algorithm}`);

    // Store results
    if (anomalies.length > 0) {
      await storeAnomalies(anomalies);
    }

    const executionTime = Date.now() - startTime;

    return new Response(JSON.stringify({
      success: true,
      anomalies_detected: anomalies.length,
      algorithm_used: algorithm,
      execution_time_ms: executionTime,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Anomaly detection failed:', error);
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

async function runAnomalyDetection(algorithm: string, lookbackDays: number): Promise<AnomalyResult[]> {
  // Fetch recent SOMA holdings and market data
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

  const { data: somaData, error: somaError } = await supabase
    .from('soma_holdings')
    .select(`
      cusip_id,
      par_amount,
      market_value,
      change_from_previous,
      holdings_date,
      cusip_metadata(maturity_bucket, duration, liquidity_tier)
    `)
    .gte('holdings_date', cutoffDate.toISOString().split('T')[0])
    .order('holdings_date', { ascending: false });

  if (somaError || !somaData) {
    throw new Error(`Failed to fetch SOMA data: ${somaError?.message}`);
  }

  const { data: microstructureData } = await supabase
    .from('market_microstructure')
    .select('*')
    .gte('trading_date', cutoffDate.toISOString().split('T')[0]);

  const anomalies: AnomalyResult[] = [];

  switch (algorithm) {
    case 'dbscan':
      anomalies.push(...await dbscanAnomalyDetection(somaData, microstructureData || []));
      break;
    case 'isolation_forest':
      anomalies.push(...await isolationForestDetection(somaData, microstructureData || []));
      break;
    case 'statistical':
      anomalies.push(...await statisticalAnomalyDetection(somaData));
      break;
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  return anomalies;
}

async function dbscanAnomalyDetection(somaData: any[], microstructureData: any[]): Promise<AnomalyResult[]> {
  console.log('Running DBSCAN clustering for anomaly detection...');
  
  // Prepare feature vectors for each CUSIP
  const cusipFeatures = new Map<string, number[]>();
  
  // Group SOMA data by CUSIP and compute features
  for (const holding of somaData) {
    const cusip = holding.cusip_id;
    if (!cusipFeatures.has(cusip)) {
      cusipFeatures.set(cusip, []);
    }
    
    const features = cusipFeatures.get(cusip)!;
    
    // Feature 1: Volatility of holdings changes (normalized)
    const changeVolatility = Math.abs(holding.change_from_previous || 0) / Math.max(holding.par_amount, 1);
    
    // Feature 2: Market value to par ratio
    const valueRatio = holding.market_value / Math.max(holding.par_amount, 1);
    
    // Feature 3: Duration proxy (from metadata)
    const duration = holding.cusip_metadata?.duration || 5.0;
    
    // Feature 4: Liquidity tier (inverted so higher tier = higher value)
    const liquidityScore = 6 - (holding.cusip_metadata?.liquidity_tier || 3);
    
    features.push(changeVolatility, valueRatio, duration / 10, liquidityScore / 5);
  }
  
  // Add microstructure features
  for (const micro of microstructureData) {
    if (cusipFeatures.has(micro.cusip_id)) {
      const features = cusipFeatures.get(micro.cusip_id)!;
      
      // Feature 5: Bid-ask spread (normalized)
      const spreadFeature = Math.min(micro.bid_ask_spread || 0, 1.0);
      
      // Feature 6: Volatility
      const volatilityFeature = Math.min(micro.volatility || 0, 0.1) * 10;
      
      features.push(spreadFeature, volatilityFeature);
    }
  }
  
  // Convert to DBSCAN points
  const points: DBSCANPoint[] = Array.from(cusipFeatures.entries()).map(([cusip, features]) => ({
    cusip_id: cusip,
    features: normalizeFeatures(features)
  }));
  
  // Run DBSCAN algorithm
  const clusters = dbscanClustering(points, 0.5, 3);
  
  // Identify anomalies (noise points and outlier clusters)
  const anomalies: AnomalyResult[] = [];
  
  for (const point of points) {
    if (point.isNoise || (point.cluster !== undefined && isOutlierCluster(point.cluster, clusters))) {
      const anomalyScore = calculateAnomalyScore(point, clusters);
      
      anomalies.push({
        cusip_id: point.cusip_id,
        anomaly_type: 'pattern',
        severity_score: Math.min(100, anomalyScore * 100),
        confidence_level: 82.5,
        detection_method: 'dbscan',
        raw_features: {
          feature_vector: point.features,
          cluster_id: point.cluster,
          is_noise: point.isNoise
        },
        anomaly_details: {
          description: point.isNoise ? 'Isolated outlier pattern' : 'Member of anomalous cluster',
          cluster_analysis: `Cluster ${point.cluster || 'NOISE'} - ${getClusterDescription(point.cluster, clusters)}`,
          anomaly_score: anomalyScore
        }
      });
    }
  }
  
  return anomalies;
}

async function isolationForestDetection(somaData: any[], microstructureData: any[]): Promise<AnomalyResult[]> {
  console.log('Running Isolation Forest anomaly detection..');
  
  const anomalies: AnomalyResult[] = [];
  
  // Simple isolation forest implementation - score based on feature isolation depth
  const cusipFeatures = new Map<string, number[]>();
  
  for (const holding of somaData) {
    const features = [
      Math.log(Math.max(holding.par_amount, 1)),
      Math.abs(holding.change_from_previous || 0) / Math.max(holding.par_amount, 1),
      holding.market_value / Math.max(holding.par_amount, 1),
      holding.cusip_metadata?.duration || 5.0
    ];
    
    cusipFeatures.set(holding.cusip_id, features);
  }
  
  // Calculate isolation scores
  for (const [cusip, features] of cusipFeatures.entries()) {
    const isolationScore = calculateIsolationScore(features, Array.from(cusipFeatures.values()));
    
    // Threshold for anomaly detection
    if (isolationScore > 0.6) {
      anomalies.push({
        cusip_id: cusip,
        anomaly_type: 'statistical',
        severity_score: Math.min(100, isolationScore * 100),
        confidence_level: 78.9,
        detection_method: 'isolation_forest',
        raw_features: {
          feature_vector: features,
          isolation_score: isolationScore
        },
        anomaly_details: {
          description: 'Statistical outlier detected via isolation',
          isolation_depth: `Score: ${isolationScore.toFixed(3)}`,
          risk_assessment: isolationScore > 0.8 ? 'high' : 'medium'
        }
      });
    }
  }
  
  return anomalies;
}

async function statisticalAnomalyDetection(somaData: any[]): Promise<AnomalyResult[]> {
  console.log('Running statistical anomaly detection...');
  
  const anomalies: AnomalyResult[] = [];
  
  // Group by CUSIP and analyze changes
  const cusipChanges = new Map<string, number[]>();
  
  for (const holding of somaData) {
    const cusip = holding.cusip_id;
    if (!cusipChanges.has(cusip)) {
      cusipChanges.set(cusip, []);
    }
    cusipChanges.get(cusip)!.push(holding.change_from_previous || 0);
  }
  
  // Statistical outlier detection using z-score
  for (const [cusip, changes] of cusipChanges.entries()) {
    if (changes.length < 3) continue;
    
    const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
    const variance = changes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / changes.length;
    const stdDev = Math.sqrt(variance);
    
    for (const change of changes) {
      const zScore = Math.abs((change - mean) / Math.max(stdDev, 1));
      
      if (zScore > 2.5) { // 2.5 sigma threshold
        anomalies.push({
          cusip_id: cusip,
          anomaly_type: 'holdings',
          severity_score: Math.min(100, zScore * 20),
          confidence_level: 91.2,
          detection_method: 'statistical_outlier',
          raw_features: {
            z_score: zScore,
            change_amount: change,
            mean_change: mean,
            std_deviation: stdDev
          },
          anomaly_details: {
            description: `Holdings change ${zScore.toFixed(1)} standard deviations from mean`,
            statistical_significance: zScore > 3 ? 'highly_significant' : 'significant',
            change_direction: change > mean ? 'accumulation' : 'reduction'
          }
        });
      }
    }
  }
  
  return anomalies;
}

// DBSCAN clustering implementation
function dbscanClustering(points: DBSCANPoint[], eps: number, minPts: number): Map<number, DBSCANPoint[]> {
  const clusters = new Map<number, DBSCANPoint[]>();
  let clusterId = 0;
  
  for (const point of points) {
    if (point.cluster !== undefined) continue; // Already processed
    
    const neighbors = getNeighbors(point, points, eps);
    
    if (neighbors.length < minPts) {
      point.isNoise = true;
      continue;
    }
    
    // Start new cluster
    point.cluster = clusterId;
    const cluster = [point];
    clusters.set(clusterId, cluster);
    
    // Expand cluster
    const queue = [...neighbors];
    while (queue.length > 0) {
      const neighbor = queue.shift()!;
      
      if (neighbor.isNoise) {
        neighbor.isNoise = false;
        neighbor.cluster = clusterId;
        cluster.push(neighbor);
      } else if (neighbor.cluster === undefined) {
        neighbor.cluster = clusterId;
        cluster.push(neighbor);
        
        const neighborNeighbors = getNeighbors(neighbor, points, eps);
        if (neighborNeighbors.length >= minPts) {
          queue.push(...neighborNeighbors.filter(n => n.cluster === undefined));
        }
      }
    }
    
    clusterId++;
  }
  
  return clusters;
}

function getNeighbors(point: DBSCANPoint, points: DBSCANPoint[], eps: number): DBSCANPoint[] {
  return points.filter(p => p !== point && euclideanDistance(point.features, p.features) <= eps);
}

function euclideanDistance(a: number[], b: number[]): number {
  const minLength = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < minLength; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

function normalizeFeatures(features: number[]): number[] {
  const max = Math.max(...features);
  const min = Math.min(...features);
  const range = max - min;
  
  if (range === 0) return features.map(() => 0);
  
  return features.map(f => (f - min) / range);
}

function isOutlierCluster(clusterId: number, clusters: Map<number, DBSCANPoint[]>): boolean {
  const cluster = clusters.get(clusterId);
  if (!cluster) return false;
  
  // Consider clusters with < 5% of total points as outliers
  const totalPoints = Array.from(clusters.values()).reduce((sum, c) => sum + c.length, 0);
  return cluster.length < Math.max(2, totalPoints * 0.05);
}

function calculateAnomalyScore(point: DBSCANPoint, clusters: Map<number, DBSCANPoint[]>): number {
  if (point.isNoise) return 0.9;
  
  const cluster = clusters.get(point.cluster!);
  if (!cluster) return 0.8;
  
  // Score based on cluster size relative to largest cluster
  const maxClusterSize = Math.max(...Array.from(clusters.values()).map(c => c.length));
  return 1 - (cluster.length / maxClusterSize);
}

function getClusterDescription(clusterId: number | undefined, clusters: Map<number, DBSCANPoint[]>): string {
  if (clusterId === undefined) return 'Noise point (no cluster)';
  
  const cluster = clusters.get(clusterId);
  if (!cluster) return 'Unknown cluster';
  
  return `${cluster.length} members, ${isOutlierCluster(clusterId, clusters) ? 'outlier' : 'normal'} size`;
}

function calculateIsolationScore(point: number[], dataset: number[][]): number {
  let totalDepth = 0;
  const numTrees = 10;
  
  for (let tree = 0; tree < numTrees; tree++) {
    totalDepth += isolationDepth(point, dataset, 0);
  }
  
  const avgDepth = totalDepth / numTrees;
  const maxDepth = Math.log2(dataset.length);
  
  return avgDepth / maxDepth;
}

function isolationDepth(point: number[], dataset: number[][], depth: number): number {
  if (dataset.length <= 1 || depth > 10) return depth;
  
  // Random feature selection
  const featureIdx = Math.floor(Math.random() * point.length);
  const featureValues = dataset.map(p => p[featureIdx]).filter(v => v !== undefined);
  
  if (featureValues.length === 0) return depth;
  
  const minVal = Math.min(...featureValues);
  const maxVal = Math.max(...featureValues);
  
  if (minVal === maxVal) return depth;
  
  // Random split point
  const splitValue = minVal + Math.random() * (maxVal - minVal);
  
  if (point[featureIdx] < splitValue) {
    const leftSubset = dataset.filter(p => p[featureIdx] < splitValue);
    return isolationDepth(point, leftSubset, depth + 1);
  } else {
    const rightSubset = dataset.filter(p => p[featureIdx] >= splitValue);
    return isolationDepth(point, rightSubset, depth + 1);
  }
}

async function storeAnomalies(anomalies: AnomalyResult[]): Promise<void> {
  const { error } = await supabase
    .from('cusip_anomalies')
    .insert(anomalies);

  if (error) {
    console.error('Failed to store anomalies:', error);
    throw new Error(`Anomaly storage failed: ${error.message}`);
  }
}