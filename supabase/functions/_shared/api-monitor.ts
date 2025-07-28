interface APIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitHits: number;
  averageResponseTime: number;
  lastRequestTime: number;
  apiSource: string;
}

class APIMonitor {
  private metrics: Map<string, APIMetrics> = new Map();

  recordRequest(
    apiSource: string,
    success: boolean,
    responseTime: number,
    wasRateLimited: boolean = false
  ): void {
    const existing = this.metrics.get(apiSource) || {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitHits: 0,
      averageResponseTime: 0,
      lastRequestTime: 0,
      apiSource
    };

    existing.totalRequests++;
    existing.lastRequestTime = Date.now();

    if (success) {
      existing.successfulRequests++;
    } else {
      existing.failedRequests++;
    }

    if (wasRateLimited) {
      existing.rateLimitHits++;
    }

    // Update rolling average response time
    existing.averageResponseTime = 
      (existing.averageResponseTime * (existing.totalRequests - 1) + responseTime) / existing.totalRequests;

    this.metrics.set(apiSource, existing);
  }

  getMetrics(apiSource?: string): APIMetrics | Map<string, APIMetrics> {
    if (apiSource) {
      return this.metrics.get(apiSource) || {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        rateLimitHits: 0,
        averageResponseTime: 0,
        lastRequestTime: 0,
        apiSource
      };
    }
    return this.metrics;
  }

  getHealthScore(apiSource: string): number {
    const metrics = this.metrics.get(apiSource);
    if (!metrics || metrics.totalRequests === 0) return 1.0;

    const successRate = metrics.successfulRequests / metrics.totalRequests;
    const rateLimitPenalty = metrics.rateLimitHits / metrics.totalRequests;
    const responsePenalty = Math.min(metrics.averageResponseTime / 5000, 1); // Penalty for slow responses

    return Math.max(0, successRate - rateLimitPenalty - responsePenalty * 0.2);
  }

  shouldCircuitBreak(apiSource: string): boolean {
    const healthScore = this.getHealthScore(apiSource);
    const metrics = this.metrics.get(apiSource);
    
    if (!metrics) return false;

    // Circuit break if health score is very low and we have enough data
    return healthScore < 0.2 && metrics.totalRequests >= 10;
  }

  reset(apiSource?: string): void {
    if (apiSource) {
      this.metrics.delete(apiSource);
    } else {
      this.metrics.clear();
    }
  }
}

export const apiMonitor = new APIMonitor();