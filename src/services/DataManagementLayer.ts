/**
 * Data Management Layer - Phase 4 Completion
 * Comprehensive data lifecycle management with validation, transformation, and storage
 */

import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';
import { CacheManager } from './CacheManager';
import UniversalDataProxyV4 from './UniversalDataProxyV4';
import type { IndicatorValue, IndicatorMetadata, IndicatorState } from '@/types/indicators';

export interface DataManagementConfig {
  enableValidation: boolean;
  enableTransformation: boolean;
  enableAggregation: boolean;
  enableHistoricalStorage: boolean;
  enableCompression: boolean;
  enableEncryption: boolean;
  maxHistoryDays: number;
  compressionThreshold: number;
  validationStrictness: 'loose' | 'normal' | 'strict';
  transformationRules: TransformationRule[];
}

export interface TransformationRule {
  id: string;
  sourcePattern: string;
  targetFormat: string;
  transformation: (data: any) => any;
  condition?: (data: any) => boolean;
  priority: number;
}

export interface DataValidationRule {
  id: string;
  field: string;
  validator: (value: any) => boolean;
  errorMessage: string;
  severity: 'warning' | 'error' | 'critical';
}

export interface DataAggregation {
  id: string;
  sourceIndicators: string[];
  aggregationType: 'sum' | 'average' | 'weighted' | 'custom';
  customFunction?: (values: IndicatorValue[]) => IndicatorValue;
  updateFrequency: number;
  dependencies: string[];
}

export interface DataStorageMetrics {
  totalRecords: number;
  compressedRecords: number;
  storageSize: number;
  compressionRatio: number;
  oldestRecord: Date | null;
  newestRecord: Date | null;
  averageRecordSize: number;
}

export interface DataQualityMetrics {
  validationScore: number;
  completenessScore: number;
  freshnessScore: number;
  consistencyScore: number;
  overallScore: number;
  issueCount: number;
  criticalIssues: number;
}

export class DataManagementLayer extends BrowserEventEmitter {
  private static instance: DataManagementLayer;
  private config: DataManagementConfig;
  
  // Core components
  private cacheManager: CacheManager;
  private dataProxy: UniversalDataProxyV4;
  
  // Data management state
  private validationRules = new Map<string, DataValidationRule[]>();
  private transformationRules = new Map<string, TransformationRule[]>();
  private aggregations = new Map<string, DataAggregation>();
  private storageMetrics: DataStorageMetrics;
  private qualityMetrics = new Map<string, DataQualityMetrics>();
  
  // Storage and processing
  private historicalData = new Map<string, IndicatorValue[]>();
  private compressedData = new Map<string, Uint8Array>();
  private processingQueue: Array<{ type: string; data: any; timestamp: Date }> = [];
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<DataManagementConfig> = {}) {
    super();
    
    this.config = {
      enableValidation: true,
      enableTransformation: true,
      enableAggregation: true,
      enableHistoricalStorage: true,
      enableCompression: false,
      enableEncryption: false,
      maxHistoryDays: 365,
      compressionThreshold: 1000,
      validationStrictness: 'normal',
      transformationRules: [],
      ...config
    };

    this.cacheManager = CacheManager.getInstance();
    this.dataProxy = UniversalDataProxyV4.getInstance();
    
    this.storageMetrics = {
      totalRecords: 0,
      compressedRecords: 0,
      storageSize: 0,
      compressionRatio: 1,
      oldestRecord: null,
      newestRecord: null,
      averageRecordSize: 0
    };

    this.initialize();
  }

  static getInstance(config?: Partial<DataManagementConfig>): DataManagementLayer {
    if (!DataManagementLayer.instance) {
      DataManagementLayer.instance = new DataManagementLayer(config);
    }
    return DataManagementLayer.instance;
  }

  async initialize(): Promise<void> {
    console.log('📊 Initializing Data Management Layer...');

    try {
      // Setup default validation rules
      this.setupDefaultValidationRules();
      
      // Setup default transformation rules
      this.setupDefaultTransformationRules();
      
      // Setup default aggregations
      this.setupDefaultAggregations();
      
      // Start processing queue
      this.startProcessingQueue();
      
      // Setup data proxy events
      this.setupDataProxyEvents();

      this.emit('data-management:initialized', { timestamp: new Date() });
      console.log('✅ Data Management Layer initialized successfully');

    } catch (error) {
      console.error('❌ Data Management Layer initialization failed:', error);
      throw error;
    }
  }

  /**
   * Ingest data with full validation and processing pipeline
   */
  async ingestData(data: {
    indicatorId: string;
    value: IndicatorValue;
    metadata?: IndicatorMetadata;
    source: string;
  }): Promise<{
    success: boolean;
    processed: IndicatorValue;
    validationResults: any[];
    transformationApplied: string[];
  }> {
    const startTime = Date.now();
    
    try {
      // Step 1: Validate data
      const validationResults = await this.validateData(data);
      
      if (this.hasBlockingValidationErrors(validationResults)) {
        return {
          success: false,
          processed: data.value,
          validationResults,
          transformationApplied: []
        };
      }

      // Step 2: Transform data
      const { transformed, transformationsApplied } = await this.transformData(data);
      
      // Step 3: Store historical data
      if (this.config.enableHistoricalStorage) {
        await this.storeHistoricalData(data.indicatorId, transformed);
      }
      
      // Step 4: Update aggregations
      if (this.config.enableAggregation) {
        await this.updateAggregations(data.indicatorId, transformed);
      }
      
      // Step 5: Update quality metrics
      await this.updateQualityMetrics(data.indicatorId, validationResults);
      
      // Step 6: Cache processed data
      await this.cacheManager.set(
        `processed:${data.indicatorId}`,
        transformed,
        300000 // 5 minutes
      );

      this.emit('data:ingested', {
        indicatorId: data.indicatorId,
        processed: transformed,
        validationResults,
        transformationsApplied,
        processingTime: Date.now() - startTime
      });

      return {
        success: true,
        processed: transformed,
        validationResults,
        transformationApplied: transformationsApplied
      };

    } catch (error) {
      console.error(`Data ingestion failed for ${data.indicatorId}:`, error);
      this.emit('data:ingestion-error', {
        indicatorId: data.indicatorId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Retrieve processed data with quality metrics
   */
  async retrieveData(indicatorId: string, options: {
    includeHistory?: boolean;
    historyDays?: number;
    includeQuality?: boolean;
    format?: 'raw' | 'processed' | 'aggregated';
  } = {}): Promise<{
    current: IndicatorValue;
    history?: IndicatorValue[];
    quality?: DataQualityMetrics;
    metadata: any;
  }> {
    const { includeHistory = false, historyDays = 30, includeQuality = true, format = 'processed' } = options;

    try {
      // Get current processed data
      let current = await this.cacheManager.get(`processed:${indicatorId}`);
      
      if (!current) {
        // Fallback to raw data from proxy
        const response = await this.dataProxy.fetchData({ indicatorId });
        current = response.data;
      }

      const result: any = {
        current,
        metadata: {
          format,
          retrievedAt: new Date(),
          source: current ? 'cache' : 'proxy'
        }
      };

      // Include historical data if requested
      if (includeHistory) {
        result.history = await this.getHistoricalData(indicatorId, historyDays);
      }

      // Include quality metrics if requested
      if (includeQuality) {
        result.quality = this.qualityMetrics.get(indicatorId) || this.getDefaultQualityMetrics();
      }

      return result;

    } catch (error) {
      console.error(`Data retrieval failed for ${indicatorId}:`, error);
      throw error;
    }
  }

  /**
   * Register custom validation rule
   */
  registerValidationRule(indicatorId: string, rule: DataValidationRule): void {
    const rules = this.validationRules.get(indicatorId) || [];
    rules.push(rule);
    this.validationRules.set(indicatorId, rules);
    
    this.emit('validation-rule:registered', { indicatorId, rule });
  }

  /**
   * Register custom transformation rule
   */
  registerTransformationRule(indicatorId: string, rule: TransformationRule): void {
    const rules = this.transformationRules.get(indicatorId) || [];
    rules.push(rule);
    rules.sort((a, b) => b.priority - a.priority);
    this.transformationRules.set(indicatorId, rules);
    
    this.emit('transformation-rule:registered', { indicatorId, rule });
  }

  /**
   * Register data aggregation
   */
  registerAggregation(aggregation: DataAggregation): void {
    this.aggregations.set(aggregation.id, aggregation);
    
    this.emit('aggregation:registered', { aggregation });
  }

  /**
   * Get comprehensive storage metrics
   */
  getStorageMetrics(): DataStorageMetrics {
    // Update metrics
    this.updateStorageMetrics();
    return { ...this.storageMetrics };
  }

  /**
   * Get quality metrics for an indicator
   */
  getQualityMetrics(indicatorId: string): DataQualityMetrics {
    return this.qualityMetrics.get(indicatorId) || this.getDefaultQualityMetrics();
  }

  /**
   * Get all quality metrics
   */
  getAllQualityMetrics(): Map<string, DataQualityMetrics> {
    return new Map(this.qualityMetrics);
  }

  /**
   * Cleanup old data based on configuration
   */
  async cleanupOldData(): Promise<{
    recordsRemoved: number;
    spaceFreed: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.maxHistoryDays);
    
    let recordsRemoved = 0;
    let spaceFreed = 0;

    for (const [indicatorId, history] of this.historicalData) {
      const originalLength = history.length;
      const filteredHistory = history.filter(record => 
        new Date(record.timestamp) > cutoffDate
      );
      
      const removed = originalLength - filteredHistory.length;
      recordsRemoved += removed;
      spaceFreed += removed * this.estimateRecordSize(indicatorId);
      
      this.historicalData.set(indicatorId, filteredHistory);
    }

    this.updateStorageMetrics();
    
    this.emit('data:cleanup-completed', {
      recordsRemoved,
      spaceFreed,
      cutoffDate
    });

    return { recordsRemoved, spaceFreed };
  }

  // === PRIVATE METHODS ===

  private setupDefaultValidationRules(): void {
    // Numeric value validation
    this.registerValidationRule('*', {
      id: 'numeric-range',
      field: 'current',
      validator: (value: number) => typeof value === 'number' && !isNaN(value) && isFinite(value),
      errorMessage: 'Value must be a valid finite number',
      severity: 'error'
    });

    // Timestamp validation
    this.registerValidationRule('*', {
      id: 'timestamp-validity',
      field: 'timestamp',
      validator: (timestamp: Date) => timestamp instanceof Date && timestamp.getTime() > 0,
      errorMessage: 'Timestamp must be a valid Date object',
      severity: 'error'
    });

    // Confidence validation
    this.registerValidationRule('*', {
      id: 'confidence-range',
      field: 'confidence',
      validator: (confidence?: number) => !confidence || (confidence >= 0 && confidence <= 1),
      errorMessage: 'Confidence must be between 0 and 1',
      severity: 'warning'
    });
  }

  private setupDefaultTransformationRules(): void {
    // Currency normalization
    this.registerTransformationRule('*', {
      id: 'currency-normalization',
      sourcePattern: 'currency',
      targetFormat: 'usd',
      transformation: (data: any) => {
        if (data.value?.current && typeof data.value.current === 'number') {
          // Simple normalization (in real app, would use exchange rates)
          return {
            ...data.value,
            normalized: data.value.current,
            currency: 'USD'
          };
        }
        return data.value;
      },
      priority: 5
    });

    // Percentage normalization
    this.registerTransformationRule('*', {
      id: 'percentage-normalization',
      sourcePattern: 'percentage',
      targetFormat: 'decimal',
      transformation: (data: any) => {
        if (data.value?.changePercent && Math.abs(data.value.changePercent) > 10) {
          // Convert large percentages to decimal if they seem to be in percentage points
          return {
            ...data.value,
            changePercent: data.value.changePercent / 100
          };
        }
        return data.value;
      },
      priority: 4
    });
  }

  private setupDefaultAggregations(): void {
    // Market sentiment aggregation
    this.registerAggregation({
      id: 'market-sentiment',
      sourceIndicators: ['VIX', 'MOVE', 'SKEW'],
      aggregationType: 'weighted',
      customFunction: (values: IndicatorValue[]) => {
        const weights = [0.5, 0.3, 0.2]; // VIX gets highest weight
        let weighted = 0;
        let totalWeight = 0;

        values.forEach((value, index) => {
          if (value && typeof value.current === 'number') {
            weighted += value.current * weights[index];
            totalWeight += weights[index];
          }
        });

        return {
          current: totalWeight > 0 ? weighted / totalWeight : 0,
          timestamp: new Date(),
          confidence: 0.8,
          synthetic: true
        };
      },
      updateFrequency: 60000, // 1 minute
      dependencies: []
    });
  }

  private startProcessingQueue(): void {
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 5000); // Process every 5 seconds
  }

  private async processQueue(): Promise<void> {
    if (this.processingQueue.length === 0) return;

    const batch = this.processingQueue.splice(0, 10); // Process 10 items at a time
    
    for (const item of batch) {
      try {
        await this.processQueueItem(item);
      } catch (error) {
        console.error('Queue processing error:', error);
      }
    }
  }

  private async processQueueItem(item: { type: string; data: any; timestamp: Date }): Promise<void> {
    switch (item.type) {
      case 'compress':
        await this.compressData(item.data);
        break;
      case 'aggregate':
        await this.updateAggregations(item.data.indicatorId, item.data.value);
        break;
      default:
        console.warn(`Unknown queue item type: ${item.type}`);
    }
  }

  private setupDataProxyEvents(): void {
    this.dataProxy.on('error', (error) => {
      this.emit('data-management:proxy-error', error);
    });

    this.dataProxy.on('circuit-breaker:opened', (event) => {
      this.emit('data-management:circuit-breaker', event);
    });
  }

  private async validateData(data: any): Promise<any[]> {
    const results: any[] = [];
    
    // Get validation rules for this indicator
    const specificRules = this.validationRules.get(data.indicatorId) || [];
    const globalRules = this.validationRules.get('*') || [];
    const allRules = [...specificRules, ...globalRules];

    for (const rule of allRules) {
      try {
        const fieldValue = this.getFieldValue(data.value, rule.field);
        const isValid = rule.validator(fieldValue);
        
        results.push({
          ruleId: rule.id,
          field: rule.field,
          isValid,
          severity: rule.severity,
          message: isValid ? null : rule.errorMessage,
          value: fieldValue
        });
      } catch (error) {
        results.push({
          ruleId: rule.id,
          field: rule.field,
          isValid: false,
          severity: 'error',
          message: `Validation rule execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          value: null
        });
      }
    }

    return results;
  }

  private async transformData(data: any): Promise<{
    transformed: IndicatorValue;
    transformationsApplied: string[];
  }> {
    let transformed = { ...data.value };
    const transformationsApplied: string[] = [];
    
    // Get transformation rules for this indicator
    const specificRules = this.transformationRules.get(data.indicatorId) || [];
    const globalRules = this.transformationRules.get('*') || [];
    const allRules = [...specificRules, ...globalRules];

    for (const rule of allRules) {
      try {
        if (rule.condition && !rule.condition({ ...data, value: transformed })) {
          continue;
        }

        const result = rule.transformation({ ...data, value: transformed });
        if (result) {
          transformed = result;
          transformationsApplied.push(rule.id);
        }
      } catch (error) {
        console.error(`Transformation rule ${rule.id} failed:`, error);
      }
    }

    return { transformed, transformationsApplied };
  }

  private async storeHistoricalData(indicatorId: string, value: IndicatorValue): Promise<void> {
    const history = this.historicalData.get(indicatorId) || [];
    history.push(value);
    
    // Keep only recent data to manage memory
    const maxHistoryPoints = 10000; // Configurable
    if (history.length > maxHistoryPoints) {
      history.splice(0, history.length - maxHistoryPoints);
    }
    
    this.historicalData.set(indicatorId, history);
    
    // Queue compression if threshold reached
    if (this.config.enableCompression && history.length > this.config.compressionThreshold) {
      this.processingQueue.push({
        type: 'compress',
        data: { indicatorId },
        timestamp: new Date()
      });
    }
  }

  private async updateAggregations(indicatorId: string, value: IndicatorValue): Promise<void> {
    for (const [aggregationId, aggregation] of this.aggregations) {
      if (aggregation.sourceIndicators.includes(indicatorId)) {
        this.processingQueue.push({
          type: 'aggregate',
          data: { aggregationId, indicatorId, value },
          timestamp: new Date()
        });
      }
    }
  }

  private async updateQualityMetrics(indicatorId: string, validationResults: any[]): Promise<void> {
    const totalRules = validationResults.length;
    const validRules = validationResults.filter(r => r.isValid).length;
    const criticalIssues = validationResults.filter(r => !r.isValid && r.severity === 'critical').length;
    
    const validationScore = totalRules > 0 ? validRules / totalRules : 1;
    
    // Calculate other scores (simplified)
    const completenessScore = 0.95; // Based on missing fields
    const freshnessScore = 0.9; // Based on data age
    const consistencyScore = 0.85; // Based on value consistency
    
    const overallScore = (validationScore + completenessScore + freshnessScore + consistencyScore) / 4;
    
    const metrics: DataQualityMetrics = {
      validationScore,
      completenessScore,
      freshnessScore,
      consistencyScore,
      overallScore,
      issueCount: validationResults.filter(r => !r.isValid).length,
      criticalIssues
    };
    
    this.qualityMetrics.set(indicatorId, metrics);
  }

  private hasBlockingValidationErrors(validationResults: any[]): boolean {
    return validationResults.some(result => 
      !result.isValid && (result.severity === 'error' || result.severity === 'critical')
    );
  }

  private getFieldValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async getHistoricalData(indicatorId: string, days: number): Promise<IndicatorValue[]> {
    const history = this.historicalData.get(indicatorId) || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return history.filter(record => new Date(record.timestamp) > cutoffDate);
  }

  private getDefaultQualityMetrics(): DataQualityMetrics {
    return {
      validationScore: 0,
      completenessScore: 0,
      freshnessScore: 0,
      consistencyScore: 0,
      overallScore: 0,
      issueCount: 0,
      criticalIssues: 0
    };
  }

  private updateStorageMetrics(): void {
    let totalRecords = 0;
    let totalSize = 0;
    let oldestRecord: Date | null = null;
    let newestRecord: Date | null = null;

    for (const [indicatorId, history] of this.historicalData) {
      totalRecords += history.length;
      totalSize += this.estimateRecordSize(indicatorId) * history.length;
      
      if (history.length > 0) {
        const oldest = new Date(history[0].timestamp);
        const newest = new Date(history[history.length - 1].timestamp);
        
        if (!oldestRecord || oldest < oldestRecord) {
          oldestRecord = oldest;
        }
        if (!newestRecord || newest > newestRecord) {
          newestRecord = newest;
        }
      }
    }

    this.storageMetrics = {
      totalRecords,
      compressedRecords: this.compressedData.size,
      storageSize: totalSize,
      compressionRatio: 1, // Would calculate based on compressed data
      oldestRecord,
      newestRecord,
      averageRecordSize: totalRecords > 0 ? totalSize / totalRecords : 0
    };
  }

  private estimateRecordSize(indicatorId: string): number {
    // Estimate average record size in bytes
    return 150; // Rough estimate for IndicatorValue object
  }

  private async compressData(data: { indicatorId: string }): Promise<void> {
    // Placeholder for data compression logic
    console.log(`Compressing data for ${data.indicatorId}`);
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Data Management Layer...');
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    // Process remaining queue items
    await this.processQueue();

    this.removeAllListeners();
    this.validationRules.clear();
    this.transformationRules.clear();
    this.aggregations.clear();
    this.historicalData.clear();
    this.compressedData.clear();
    this.qualityMetrics.clear();

    this.emit('data-management:shutdown', { timestamp: new Date() });
    console.log('✅ Data Management Layer shutdown complete');
  }
}

export default DataManagementLayer;
