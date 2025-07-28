interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

interface RetryableError extends Error {
  status?: number;
  retryable?: boolean;
}

export class RetryHandler {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      ...config
    };
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: RetryableError;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as RetryableError;
        
        if (!this.isRetryable(lastError) || attempt === this.config.maxRetries) {
          console.error(`${context} failed after ${attempt + 1} attempts:`, lastError.message);
          throw lastError;
        }

        const delay = Math.min(
          this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempt),
          this.config.maxDelay
        );

        console.log(`${context} attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private isRetryable(error: RetryableError): boolean {
    if (error.retryable === false) return false;
    
    // Rate limiting and temporary server errors
    const retryableStatuses = [429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status || 0);
  }
}

export const defaultRetryHandler = new RetryHandler();