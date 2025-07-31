import { IndicatorMetadata, IndicatorSource, IndicatorFilter } from '@/types/indicators';
import { ALL_MASTER_PROMPT_INDICATORS } from '@/config/masterPromptsIndicators.config';

/**
 * Central registry for all financial indicators
 * Manages metadata, categories, and provides unified access patterns
 * Enhanced to support 50+ indicators with live data feeds
 */
export class IndicatorRegistry {
  private static instance: IndicatorRegistry;
  private indicators: Map<string, IndicatorMetadata> = new Map();
  private categories: Set<string> = new Set();
  private sources: Set<IndicatorSource> = new Set();

  private constructor() {
    this.loadDefaultIndicators();
    this.loadMasterPromptIndicators();
  }

  static getInstance(): IndicatorRegistry {
    if (!IndicatorRegistry.instance) {
      IndicatorRegistry.instance = new IndicatorRegistry();
    }
    return IndicatorRegistry.instance;
  }

  /**
   * Register a new indicator or update existing one
   */
  register(metadata: IndicatorMetadata): void {
    this.indicators.set(metadata.id, metadata);
    this.categories.add(metadata.category);
    this.sources.add(metadata.source);
  }

  /**
   * Get indicator metadata by ID
   */
  get(id: string): IndicatorMetadata | undefined {
    return this.indicators.get(id);
  }

  /**
   * Get all indicators with optional filtering
   */
  getAll(filter?: IndicatorFilter): IndicatorMetadata[] {
    let result = Array.from(this.indicators.values());

    if (filter) {
      if (filter.source) {
        result = result.filter(ind => ind.source === filter.source);
      }
      if (filter.category) {
        result = result.filter(ind => ind.category === filter.category);
      }
      if (filter.pillar !== undefined) {
        result = result.filter(ind => ind.pillar === filter.pillar);
      }
      if (filter.tags && filter.tags.length > 0) {
        result = result.filter(ind => 
          ind.tags && filter.tags!.some(tag => ind.tags!.includes(tag))
        );
      }
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        result = result.filter(ind => 
          ind.name.toLowerCase().includes(searchLower) ||
          ind.symbol.toLowerCase().includes(searchLower) ||
          (ind.description && ind.description.toLowerCase().includes(searchLower))
        );
      }
    }

    return result.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get indicators by category
   */
  getByCategory(category: string): IndicatorMetadata[] {
    return this.getAll({ category });
  }

  /**
   * Get indicators by source
   */
  getBySource(source: IndicatorSource): IndicatorMetadata[] {
    return this.getAll({ source });
  }

  /**
   * Get indicators by pillar
   */
  getByPillar(pillar: number): IndicatorMetadata[] {
    return this.getAll({ pillar });
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return Array.from(this.categories).sort();
  }

  /**
   * Get all available sources
   */
  getSources(): IndicatorSource[] {
    return Array.from(this.sources);
  }

  /**
   * Check if indicator exists
   */
  exists(id: string): boolean {
    return this.indicators.has(id);
  }

  /**
   * Remove indicator from registry
   */
  unregister(id: string): boolean {
    return this.indicators.delete(id);
  }

  /**
   * Get indicator count
   */
  count(): number {
    return this.indicators.size;
  }

  /**
   * Bulk register indicators
   */
  registerBulk(indicators: IndicatorMetadata[]): void {
    indicators.forEach(indicator => this.register(indicator));
  }

  /**
   * Load comprehensive set of indicators from Master Prompts configuration
   */
  private loadMasterPromptIndicators(): void {
    // Convert master prompt indicators to IndicatorMetadata format
    const indicators: IndicatorMetadata[] = ALL_MASTER_PROMPT_INDICATORS.map(config => ({
      id: config.id,
      symbol: config.symbol || config.id.toUpperCase(),
      name: config.name,
      description: config.description || `${config.name} - ${config.category} indicator`,
      source: config.source as IndicatorSource,
      category: config.category,
      pillar: typeof config.pillar === 'number' ? config.pillar : 1,
      priority: (config.criticality === 'CRITICAL' ? 0 : 
                config.criticality === 'HIGH' ? 10 : 
                config.criticality === 'MEDIUM' ? 20 : 30),
      updateFrequency: this.convertRefreshInterval(config.refreshInterval) as any,
      unit: config.unit,
      precision: 2,
      apiEndpoint: this.generateApiEndpoint(config),
      transformFunction: config.transformFunction,
      dependencies: config.dependencies,
      tags: config.tags || [config.category, config.source.toLowerCase()]
    }));

    this.registerBulk(indicators);
    console.log(`Loaded ${indicators.length} master prompt indicators`);
  }

  /**
   * Load default indicators from existing services (legacy support)
   */
  private loadDefaultIndicators(): void {
    const defaultIndicators: IndicatorMetadata[] = [
      // Engine-derived indicators that aren't in master prompts
      {
        id: 'data-integrity',
        symbol: 'DATA_INTEGRITY',
        name: 'Data Integrity',
        description: 'Foundation Data Integrity Engine - Monitors data source health and system integrity',
        source: 'ENGINE',
        category: 'foundation',
        pillar: 0,
        priority: 0,
        updateFrequency: '15m',
        unit: 'Score',
        precision: 1,
        transformFunction: 'dataIntegrity',
        tags: ['foundation', 'integrity', 'monitoring']
      }
    ];

    this.registerBulk(defaultIndicators);
  }

  /**
   * Convert refresh interval to standard format
   */
  private convertRefreshInterval(interval: number): string {
    if (interval <= 15000) return 'realtime';
    if (interval <= 60000) return '1m';
    if (interval <= 300000) return '5m';
    if (interval <= 900000) return '15m';
    if (interval <= 3600000) return '1h';
    if (interval <= 86400000) return '1d';
    return '1w';
  }

  /**
   * Generate appropriate API endpoint based on source and symbol
   */
  private generateApiEndpoint(config: any): string {
    switch (config.source) {
      case 'FRED':
        return `/observations?series_id=${config.symbol}`;
      case 'COINBASE':
        return `/products/${config.symbol}/ticker`;
      case 'GLASSNODE':
        return `/v1/metrics/${config.symbol}`;
      case 'MARKET':
        return `/quote/${config.symbol}`;
      default:
        return '';
    }
  }
}