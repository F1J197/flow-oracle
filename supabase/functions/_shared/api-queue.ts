interface QueueItem<T = any> {
  id: string;
  operation: () => Promise<T>;
  priority: number;
  context: string;
  retries: number;
  maxRetries: number;
  createdAt: number;
}

export class APIQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private concurrentLimit: number;
  private activeRequests = 0;

  constructor(concurrentLimit: number = 3) {
    this.concurrentLimit = concurrentLimit;
  }

  async enqueue<T>(
    operation: () => Promise<T>,
    options: {
      priority?: number;
      context?: string;
      maxRetries?: number;
    } = {}
  ): Promise<T> {
    const item: QueueItem<T> = {
      id: crypto.randomUUID(),
      operation,
      priority: options.priority || 0,
      context: options.context || 'api-call',
      retries: 0,
      maxRetries: options.maxRetries || 3,
      createdAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const wrappedOperation = async () => {
        try {
          const result = await operation();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      };

      item.operation = wrappedOperation;
      this.queue.push(item);
      this.sortQueue();
      this.processQueue();
    });
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      // Higher priority first, then older items
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt - b.createdAt;
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.activeRequests >= this.concurrentLimit) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.concurrentLimit) {
      const item = this.queue.shift()!;
      this.activeRequests++;

      // Process item without blocking the queue
      this.processItem(item).finally(() => {
        this.activeRequests--;
        if (this.queue.length > 0) {
          this.processQueue();
        } else {
          this.processing = false;
        }
      });
    }

    this.processing = false;
  }

  private async processItem(item: QueueItem): Promise<void> {
    try {
      await item.operation();
    } catch (error) {
      console.error(`Queue item ${item.id} failed:`, error);
      
      if (item.retries < item.maxRetries) {
        item.retries++;
        console.log(`Retrying queue item ${item.id}, attempt ${item.retries}`);
        
        // Add back to queue with delay
        setTimeout(() => {
          this.queue.unshift(item);
          this.processQueue();
        }, 1000 * Math.pow(2, item.retries));
      }
    }
  }

  getStats(): { queueSize: number; activeRequests: number; processing: boolean } {
    return {
      queueSize: this.queue.length,
      activeRequests: this.activeRequests,
      processing: this.processing
    };
  }
}

export const globalAPIQueue = new APIQueue();