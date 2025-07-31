/**
 * Rate Limiter for API requests
 * Prevents overwhelming external APIs with too many requests
 */

interface RequestQueue {
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private queues: Map<string, RequestQueue[]> = new Map();
  private lastRequestTime: Map<string, number> = new Map();
  private processing: Map<string, boolean> = new Map();

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  private constructor() {}

  /**
   * Execute a function with rate limiting
   * @param key - Unique identifier for the rate limit (e.g., 'fred-api')
   * @param fn - Function to execute
   * @param minInterval - Minimum time between requests in milliseconds
   */
  async execute<T>(
    key: string, 
    fn: () => Promise<T>, 
    minInterval: number = 1000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Add to queue
      if (!this.queues.has(key)) {
        this.queues.set(key, []);
      }
      
      this.queues.get(key)!.push({
        execute: fn,
        resolve,
        reject
      });

      // Process queue if not already processing
      if (!this.processing.get(key)) {
        this.processQueue(key, minInterval);
      }
    });
  }

  private async processQueue(key: string, minInterval: number): Promise<void> {
    this.processing.set(key, true);
    const queue = this.queues.get(key) || [];

    while (queue.length > 0) {
      const request = queue.shift()!;
      
      // Check if we need to wait
      const lastRequest = this.lastRequestTime.get(key) || 0;
      const timeSinceLastRequest = Date.now() - lastRequest;
      
      if (timeSinceLastRequest < minInterval) {
        const waitTime = minInterval - timeSinceLastRequest;
        console.log(`Rate limiter: Waiting ${waitTime}ms for ${key}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      try {
        this.lastRequestTime.set(key, Date.now());
        const result = await request.execute();
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }

    this.processing.set(key, false);
  }

  /**
   * Clear all queues and reset state
   */
  reset(): void {
    this.queues.clear();
    this.lastRequestTime.clear();
    this.processing.clear();
  }

  /**
   * Get queue status for debugging
   */
  getStatus(): Record<string, { queueLength: number; processing: boolean; lastRequest: number }> {
    const status: Record<string, any> = {};
    
    for (const [key, queue] of this.queues.entries()) {
      status[key] = {
        queueLength: queue.length,
        processing: this.processing.get(key) || false,
        lastRequest: this.lastRequestTime.get(key) || 0
      };
    }
    
    return status;
  }
}