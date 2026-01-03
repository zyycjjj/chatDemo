type NetworkStatus = 'online' | 'offline';

interface NetworkListener {
  (isOnline: boolean): void;
}

export class NetworkService {
  private isOnline: boolean = navigator.onLine;
  private listeners: NetworkListener[] = [];

  constructor() {
    this.initializeListeners();
  }

  private initializeListeners() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notifyListeners();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notifyListeners();
  };

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  public getStatus(): NetworkStatus {
    return this.isOnline ? 'online' : 'offline';
  }

  public isCurrentlyOnline(): boolean {
    return this.isOnline;
  }

  public subscribe(listener: NetworkListener): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.listeners = [];
  }
}