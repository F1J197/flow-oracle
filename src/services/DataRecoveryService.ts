import { supabase } from '@/integrations/supabase/client';
import FREDService from './FREDService';
import AlternativeDataService from './AlternativeDataService';

export interface DataRecoveryOptions {
  forceRefresh?: boolean;
  useAlternativeSources?: boolean;
  maxRetries?: number;
  prioritySymbols?: string[];
}

export interface RecoveryReport {
  totalAttempted: number;
  successful: number;
  failed: number;
  recoveredSymbols: string[];
  failedSymbols: string[];
  errors: Record<string, string>;
  alternativeSourcesUsed: Record<string, string>;
}

class DataRecoveryService {
  private static instance: DataRecoveryService;
  private fredService: FREDService;
  private altService: AlternativeDataService;

  private constructor() {
    this.fredService = FREDService.getInstance();
    this.altService = AlternativeDataService.getInstance();
  }

  static getInstance(): DataRecoveryService {
    if (!DataRecoveryService.instance) {
      DataRecoveryService.instance = new DataRecoveryService();
    }
    return DataRecoveryService.instance;
  }

  async recoverMissingIndicators(options: DataRecoveryOptions = {}): Promise<RecoveryReport> {
    const {
      forceRefresh = false,
      useAlternativeSources = true,
      maxRetries = 3,
      prioritySymbols = []
    } = options;

    console.log('🔄 Starting data recovery process...');

    const report: RecoveryReport = {
      totalAttempted: 0,
      successful: 0,
      failed: 0,
      recoveredSymbols: [],
      failedSymbols: [],
      errors: {},
      alternativeSourcesUsed: {}
    };

    try {
      // Get all active indicators that need data
      const { data: indicators, error } = await supabase
        .from('indicators')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch indicators: ${error.message}`);
      }

      if (!indicators || indicators.length === 0) {
        console.warn('No active indicators found');
        return report;
      }

      // Filter and prioritize indicators
      const targetIndicators = this.prioritizeIndicators(indicators, prioritySymbols);
      report.totalAttempted = targetIndicators.length;

      console.log(`📊 Attempting to recover ${targetIndicators.length} indicators...`);

      // Process indicators in batches to avoid overwhelming APIs
      const batchSize = 3;
      for (let i = 0; i < targetIndicators.length; i += batchSize) {
        const batch = targetIndicators.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(indicator => 
            this.recoverIndicatorData(indicator, {
              forceRefresh,
              useAlternativeSources,
              maxRetries
            }, report)
          )
        );

        // Add delay between batches to respect rate limits
        if (i + batchSize < targetIndicators.length) {
          await this.delay(2000);
        }
      }

      console.log(`✅ Data recovery completed. Success: ${report.successful}/${report.totalAttempted}`);
      return report;

    } catch (error) {
      console.error('❌ Data recovery process failed:', error);
      report.errors['system'] = error.message;
      return report;
    }
  }

  private async recoverIndicatorData(
    indicator: any,
    options: DataRecoveryOptions,
    report: RecoveryReport
  ): Promise<void> {
    const { symbol, data_source, metadata } = indicator;
    let attempts = 0;
    const { maxRetries = 3, forceRefresh, useAlternativeSources } = options;

    while (attempts < maxRetries) {
      try {
        attempts++;
        console.log(`🔄 Attempting to recover ${symbol} (attempt ${attempts}/${maxRetries})`);

        let data: any[] = [];
        let sourceUsed = data_source;

        // First try primary data source
        if (data_source === 'FRED') {
          data = await this.fredService.fetchSeries(symbol);
        } else if (data_source === 'ALTERNATIVE' && useAlternativeSources) {
          data = await this.altService.fetchFromMultipleSources(symbol);
          const altSources = metadata?.alternative_sources || [];
          if (altSources.length > 0) {
            sourceUsed = altSources[0];
          }
        }

        // If primary source failed and alternatives are enabled, try them
        if (data.length === 0 && useAlternativeSources) {
          const altSources = metadata?.alternative_sources || [];
          for (const altSource of altSources) {
            try {
              console.log(`🔄 Trying alternative source ${altSource} for ${symbol}`);
              data = await this.altService.fetchFromMultipleSources(symbol);
              if (data.length > 0) {
                sourceUsed = altSource;
                report.alternativeSourcesUsed[symbol] = altSource;
                break;
              }
            } catch (altError) {
              console.warn(`Alternative source ${altSource} failed for ${symbol}:`, altError);
            }
          }
        }

        if (data.length > 0) {
          // Store the recovered data
          await this.storeRecoveredData(indicator.id, data, sourceUsed);
          
          report.successful++;
          report.recoveredSymbols.push(symbol);
          
          console.log(`✅ Successfully recovered ${symbol} with ${data.length} data points`);
          return; // Success, exit retry loop
        }

        console.warn(`⚠️ No data recovered for ${symbol} on attempt ${attempts}`);

      } catch (error) {
        console.error(`❌ Error recovering ${symbol} (attempt ${attempts}):`, error);
        report.errors[`${symbol}_attempt_${attempts}`] = error.message;

        if (attempts < maxRetries) {
          await this.delay(1000 * attempts); // Exponential backoff
        }
      }
    }

    // All attempts failed
    report.failed++;
    report.failedSymbols.push(symbol);
    report.errors[symbol] = `Failed after ${maxRetries} attempts`;
  }

  private prioritizeIndicators(indicators: any[], prioritySymbols: string[]): any[] {
    // Create a priority map
    const priorityMap = new Map(prioritySymbols.map((symbol, index) => [symbol, index]));

    return indicators.sort((a, b) => {
      const aPriority = priorityMap.get(a.symbol) ?? 999;
      const bPriority = priorityMap.get(b.symbol) ?? 999;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Secondary sort by database priority
      return (b.priority || 0) - (a.priority || 0);
    });
  }

  private async storeRecoveredData(indicatorId: string, data: any[], source: string): Promise<void> {
    try {
      // Store the latest data point
      const latestPoint = data[0];
      if (!latestPoint) return;

      const { error } = await supabase
        .from('data_points')
        .insert({
          indicator_id: indicatorId,
          timestamp: latestPoint.date + 'T00:00:00+00:00',
          value: typeof latestPoint.value === 'number' ? latestPoint.value : parseFloat(latestPoint.value),
          confidence_score: 0.9, // Slightly lower confidence for recovered data
          raw_data: {
            ...latestPoint,
            recovery_source: source,
            recovered_at: new Date().toISOString()
          }
        });

      if (error) {
        console.error(`Failed to store recovered data for indicator ${indicatorId}:`, error);
      }

      // Update indicator's last_updated timestamp
      await supabase
        .from('indicators')
        .update({ last_updated: new Date().toISOString() })
        .eq('id', indicatorId);

    } catch (error) {
      console.error(`Error storing recovered data:`, error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getRecoveryStatus(): Promise<{
    totalIndicators: number;
    withRecentData: number;
    staleIndicators: number;
    missingDataIndicators: string[];
  }> {
    try {
      const { data: indicators, error } = await supabase
        .from('indicators')
        .select(`
          id,
          symbol,
          last_updated,
          data_points!inner(id, timestamp)
        `)
        .eq('is_active', true);

      if (error) {
        throw new Error(`Failed to get recovery status: ${error.message}`);
      }

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      let withRecentData = 0;
      let staleIndicators = 0;
      const missingDataIndicators: string[] = [];

      indicators?.forEach(indicator => {
        if (!indicator.data_points || indicator.data_points.length === 0) {
          missingDataIndicators.push(indicator.symbol);
        } else {
          const lastUpdate = new Date(indicator.last_updated || '1970-01-01');
          if (lastUpdate > oneDayAgo) {
            withRecentData++;
          } else {
            staleIndicators++;
          }
        }
      });

      return {
        totalIndicators: indicators?.length || 0,
        withRecentData,
        staleIndicators,
        missingDataIndicators
      };

    } catch (error) {
      console.error('Error getting recovery status:', error);
      return {
        totalIndicators: 0,
        withRecentData: 0,
        staleIndicators: 0,
        missingDataIndicators: []
      };
    }
  }
}

export default DataRecoveryService;