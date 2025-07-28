import { useCallback } from 'react';

interface TimeoutConfig {
  timeout: number;
  operation: string;
}

export const useEngineTimeout = () => {
  const withTimeout = useCallback(async <T>(
    operation: () => Promise<T>,
    config: TimeoutConfig
  ): Promise<T> => {
    const { timeout, operation: operationName } = config;
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operationName} timeout after ${timeout}ms`));
      }, timeout);
    });

    try {
      return await Promise.race([operation(), timeoutPromise]);
    } catch (error) {
      console.error(`${operationName} failed:`, error);
      throw error;
    }
  }, []);

  const withRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    config: TimeoutConfig & { retries?: number }
  ): Promise<T> => {
    const { retries = 2 } = config;
    let lastError: Error;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        return await withTimeout(operation, config);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt <= retries) {
          console.warn(`${config.operation} attempt ${attempt} failed, retrying...`, error);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError!;
  }, [withTimeout]);

  return { withTimeout, withRetry };
};