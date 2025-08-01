export class PWAService {
  private static instance: PWAService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;
  private subscribers: ((isOnline: boolean) => void)[] = [];

  private constructor() {
    this.setupOnlineStatusListeners();
  }

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  async initialize(): Promise<void> {
    console.log('[PWA] Initializing PWA service...');
    
    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Setup push notifications if supported
      if (this.isPushSupported()) {
        await this.initializePushNotifications();
      }
      
      // Setup background sync
      if (this.isBackgroundSyncSupported()) {
        this.setupBackgroundSync();
      }
      
      console.log('[PWA] PWA service initialized successfully');
    } catch (error) {
      console.error('[PWA] Failed to initialize PWA service:', error);
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.swRegistration = registration;
      console.log('[PWA] Service Worker registered successfully');

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUserOfUpdate();
            }
          });
        }
      });

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  }

  private setupOnlineStatusListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifySubscribers();
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifySubscribers();
    });
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.isOnline));
  }

  public subscribeToOnlineStatus(callback: (isOnline: boolean) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Push Notifications
  private isPushSupported(): boolean {
    return 'PushManager' in window && 'Notification' in window;
  }

  private async initializePushNotifications(): Promise<void> {
    if (!this.swRegistration) {
      console.warn('[PWA] No service worker registration for push notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('[PWA] Push notification permission granted');
        
        // Subscribe to push notifications
        const subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.getVapidPublicKey())
        });

        console.log('[PWA] Push subscription created:', subscription);
        
        // Send subscription to server
        await this.sendSubscriptionToServer(subscription);
      } else {
        console.warn('[PWA] Push notification permission denied');
      }
    } catch (error) {
      console.error('[PWA] Failed to initialize push notifications:', error);
    }
  }

  private getVapidPublicKey(): string {
    // In production, this would be your actual VAPID public key
    return 'BEl62iUYgUivxIkv69yViEuiBIa40HI80YWTyQ3c1LYk9XE_NgJMgb_ZeR0WsE1qFJpYoOcQOsE-r1PKKx2Nn_s';
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // Send subscription to your backend
    try {
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      if (response.ok) {
        console.log('[PWA] Subscription sent to server successfully');
      }
    } catch (error) {
      console.error('[PWA] Failed to send subscription to server:', error);
    }
  }

  // Background Sync
  private isBackgroundSyncSupported(): boolean {
    return 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
  }

  private setupBackgroundSync(): void {
    // Register for background sync when online
    navigator.serviceWorker.ready.then(registration => {
      if ('sync' in registration) {
        console.log('[PWA] Background sync supported');
      }
    });
  }

  public async scheduleBackgroundSync(tag: string): Promise<void> {
    if (!this.isBackgroundSyncSupported()) {
      console.warn('[PWA] Background sync not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log(`[PWA] Background sync scheduled: ${tag}`);
    } catch (error) {
      console.error('[PWA] Failed to schedule background sync:', error);
    }
  }

  private async syncWhenOnline(): Promise<void> {
    if (this.isOnline) {
      await this.scheduleBackgroundSync('sync-engine-data');
    }
  }

  // Cache Management
  public async getCacheStatus(): Promise<any> {
    if (!this.swRegistration) return null;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_STATUS') {
          resolve(event.data.data);
        }
      };

      navigator.serviceWorker.controller?.postMessage(
        { type: 'GET_CACHE_STATUS' },
        [messageChannel.port2]
      );
    });
  }

  public async clearAllCaches(): Promise<void> {
    if (!this.swRegistration) return;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_CLEARED') {
          resolve();
        }
      };

      navigator.serviceWorker.controller?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  // App Update Management
  private notifyUserOfUpdate(): void {
    // Show update available notification
    if (window.confirm('A new version of LIQUIDITY² Terminal is available. Update now?')) {
      this.applyUpdate();
    }
  }

  public async applyUpdate(): Promise<void> {
    if (!this.swRegistration || !this.swRegistration.waiting) return;

    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  // Installation Prompt
  private deferredPrompt: any = null;

  public setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      this.deferredPrompt = e;
      console.log('[PWA] Install prompt available');
    });

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App was installed');
      this.deferredPrompt = null;
    });
  }

  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('[PWA] Install prompt not available');
      return false;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    
    console.log(`[PWA] User response to install prompt: ${outcome}`);
    
    // Clear the deferredPrompt variable
    this.deferredPrompt = null;
    
    return outcome === 'accepted';
  }

  public isInstallPromptAvailable(): boolean {
    return this.deferredPrompt !== null;
  }

  // Offline Data Management
  public async saveOfflineData(key: string, data: any): Promise<void> {
    try {
      const serializedData = JSON.stringify({
        data,
        timestamp: Date.now(),
        type: 'offline-data'
      });
      
      localStorage.setItem(`offline_${key}`, serializedData);
      console.log(`[PWA] Offline data saved: ${key}`);
    } catch (error) {
      console.error('[PWA] Failed to save offline data:', error);
    }
  }

  public getOfflineData(key: string): any | null {
    try {
      const serializedData = localStorage.getItem(`offline_${key}`);
      if (!serializedData) return null;

      const parsedData = JSON.parse(serializedData);
      
      // Check if data is not too old (24 hours)
      const dayInMs = 24 * 60 * 60 * 1000;
      if (Date.now() - parsedData.timestamp > dayInMs) {
        localStorage.removeItem(`offline_${key}`);
        return null;
      }

      return parsedData.data;
    } catch (error) {
      console.error('[PWA] Failed to get offline data:', error);
      return null;
    }
  }

  public clearOfflineData(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('offline_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('[PWA] Offline data cleared');
  }

  // Network Status
  public getNetworkInfo(): any {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    
    return { effectiveType: 'unknown' };
  }

  // Performance Monitoring
  public trackPerformance(metricName: string, value: number): void {
    try {
      if ('performance' in window && 'measure' in performance) {
        performance.mark(`${metricName}-start`);
        performance.mark(`${metricName}-end`);
        performance.measure(metricName, `${metricName}-start`, `${metricName}-end`);
      }
      
      console.log(`[PWA] Performance metric: ${metricName} = ${value}ms`);
    } catch (error) {
      console.error('[PWA] Failed to track performance:', error);
    }
  }
}

// Export singleton instance
export const pwaService = PWAService.getInstance();