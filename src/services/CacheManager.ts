import { CacheEntry } from '@/types/indicators';

/**
 * Advanced cache manager with TTL support and memory optimization
 */
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private maxSize: number = 15000; // Increased for real-time data
  private defaultTTL: number = 15 * 1000; // 15 seconds for Z-Score real-time

  private constructor() {
    this.startCleanupProcess();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttl?: number, source?: string): void {
    // Check if we need to evict old entries
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date(),
      ttl: ttl || this.defaultTTL,
      source: source || 'unknown'
    };

    this.cache.set(key, entry);
  }

  /**
   * Get cache entry if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = new Date();
    let validEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      totalSize += this.estimateSize(entry);
      
      if (this.isExpired(entry)) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      estimatedSizeKB: Math.round(totalSize / 1024),
      hitRate: this.getHitRate(),
      maxSize: this.maxSize
    };
  }

  /**
   * Get all keys matching pattern
   */
  getKeys(pattern?: RegExp): string[] {
    const keys = Array.from(this.cache.keys());
    
    if (!pattern) {
      return keys;
    }

    return keys.filter(key => pattern.test(key));
  }

  /**
   * Get entries by source
   */
  getBySource(source: string): Array<{ key: string; entry: CacheEntry }> {
    const result: Array<{ key: string; entry: CacheEntry }> = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.source === source && !this.isExpired(entry)) {
        result.push({ key, entry });
      }
    }

    return result;
  }

  /**
   * Invalidate entries by pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Invalidate entries by source
   */
  invalidateSource(source: string): number {
    let deletedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.source === source) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Update cache configuration
   */
  configure(options: { maxSize?: number; defaultTTL?: number }): void {
    if (options.maxSize) {
      this.maxSize = options.maxSize;
    }
    
    if (options.defaultTTL) {
      this.defaultTTL = options.defaultTTL;
    }
  }

  /**
   * Check if entry has expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = new Date();
    return (now.getTime() - entry.timestamp.getTime()) > entry.ttl;
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = new Date();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Estimate entry size in bytes
   */
  private estimateSize(entry: CacheEntry): number {
    try {
      return JSON.stringify(entry).length * 2; // Rough estimate
    } catch {
      return 1024; // Default estimate
    }
  }

  /**
   * Calculate hit rate (placeholder - would need request tracking)
   */
  private getHitRate(): number {
    // This would require tracking hits/misses over time
    // For now, return a placeholder
    return 0.85;
  }

  /**
   * Start cleanup process for expired entries
   */
  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000); // Cleanup every 30 seconds for faster real-time refresh
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}