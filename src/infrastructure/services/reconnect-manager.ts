export class ReconnectManager {
  private static readonly DEFAULT_DELAYS = [1000, 2000, 5000, 10000, 30000];
  private static readonly MAX_DELAY = 60000;
  
  private retryCount: number = 0;
  private isRetrying: boolean = false;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;

  public async attemptReconnect(
    operation: () => Promise<boolean>,
    onSuccess: () => void,
    _onFailure: (error: Error) => void,
    customDelays?: number[]
  ): Promise<void> {
    if (this.isRetrying) {
      return;
    }

    this.isRetrying = true;
    const delays = customDelays || ReconnectManager.DEFAULT_DELAYS;

    const tryReconnect = async (attempt: number) => {
      try {
        const success = await operation();
        
        if (success) {
          this.reset();
          onSuccess();
          return;
        }
        
        if (attempt < delays.length) {
          this.scheduleRetry(delays[attempt], () => tryReconnect(attempt + 1));
        } else {
          this.scheduleRetry(ReconnectManager.MAX_DELAY, () => tryReconnect(attempt + 1));
        }
      } catch {
        if (attempt < delays.length) {
          this.scheduleRetry(delays[attempt], () => tryReconnect(attempt + 1));
        } else {
          this.scheduleRetry(ReconnectManager.MAX_DELAY, () => tryReconnect(attempt + 1));
        }
      }
    };

    tryReconnect(0);
  }

  private scheduleRetry(delay: number, callback: () => void) {
    this.retryTimeout = setTimeout(callback, delay);
  }

  public cancelRetry(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.isRetrying = false;
  }

  public reset(): void {
    this.cancelRetry();
    this.retryCount = 0;
  }

  public getRetryCount(): number {
    return this.retryCount;
  }

  public isCurrentlyRetrying(): boolean {
    return this.isRetrying;
  }

  public getNextRetryDelay(): number {
    const delays = ReconnectManager.DEFAULT_DELAYS;
    if (this.retryCount < delays.length) {
      return delays[this.retryCount];
    }
    return ReconnectManager.MAX_DELAY;
  }

  public destroy(): void {
    this.cancelRetry();
  }
}