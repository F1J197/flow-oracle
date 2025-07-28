interface RateLimiterConfig {
  requestsPerMinute: number;
  burstSize?: number;
}

interface RateLimiterState {
  tokens: number;
  lastRefill: number;
}

class RateLimiter {
  private config: RateLimiterConfig;
  private state: RateLimiterState;
  private readonly refillInterval = 60000; // 1 minute in ms

  constructor(config: RateLimiterConfig) {
    this.config = {
      burstSize: config.requestsPerMinute,
      ...config
    };
    this.state = {
      tokens: this.config.burstSize!,
      lastRefill: Date.now()
    };
  }

  async waitForToken(): Promise<void> {
    this.refillTokens();
    
    if (this.state.tokens >= 1) {
      this.state.tokens--;
      return;
    }

    // Calculate wait time until next token is available
    const tokensPerMs = this.config.requestsPerMinute / this.refillInterval;
    const waitTime = Math.ceil(1 / tokensPerMs);
    
    console.log(`Rate limit reached, waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // Recursively try again
    return this.waitForToken();
  }

  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.state.lastRefill;
    
    if (elapsed >= this.refillInterval) {
      // Full refill every minute
      this.state.tokens = this.config.burstSize!;
      this.state.lastRefill = now;
    } else {
      // Gradual refill based on elapsed time
      const tokensToAdd = (elapsed / this.refillInterval) * this.config.requestsPerMinute;
      this.state.tokens = Math.min(this.config.burstSize!, this.state.tokens + tokensToAdd);
    }
  }

  getStatus(): { tokens: number; requestsPerMinute: number } {
    this.refillTokens();
    return {
      tokens: this.state.tokens,
      requestsPerMinute: this.config.requestsPerMinute
    };
  }
}

// Global rate limiters for different APIs
export const rateLimiters = {
  finnhub: new RateLimiter({ requestsPerMinute: 60 }),
  fred: new RateLimiter({ requestsPerMinute: 120 }),
  twelvedata: new RateLimiter({ requestsPerMinute: 800 }), // Free tier
  fmp: new RateLimiter({ requestsPerMinute: 250 }), // Free tier
  marketstack: new RateLimiter({ requestsPerMinute: 1000 }), // Free tier
  polygon: new RateLimiter({ requestsPerMinute: 500 }), // Free tier
  coingecko: new RateLimiter({ requestsPerMinute: 30 }), // Free tier
  alphavantage: new RateLimiter({ requestsPerMinute: 25 }) // Free tier
};

export { RateLimiter };