

export interface QueuedMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export class OfflineQueue {
  private static readonly STORAGE_KEY = 'offline_message_queue';
  private queue: QueuedMessage[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(OfflineQueue.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(OfflineQueue.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  public add(message: Omit<QueuedMessage, 'id' | 'timestamp' | 'retryCount'>): void {
    const queuedMessage: QueuedMessage = {
      ...message,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedMessage);
    this.saveToStorage();
  }

  public getAll(): QueuedMessage[] {
    return [...this.queue];
  }

  public getRetryableMessages(): QueuedMessage[] {
    return this.queue.filter(msg => msg.retryCount < msg.maxRetries);
  }

  public markRetry(id: string): boolean {
    const message = this.queue.find(msg => msg.id === id);
    if (message) {
      message.retryCount++;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public remove(id: string): boolean {
    const index = this.queue.findIndex(msg => msg.id === id);
    if (index > -1) {
      this.queue.splice(index, 1);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public clear(): void {
    this.queue = [];
    this.saveToStorage();
  }

  public getFailedMessages(): QueuedMessage[] {
    return this.queue.filter(msg => msg.retryCount >= msg.maxRetries);
  }

  public getPendingCount(): number {
    return this.queue.length;
  }
}