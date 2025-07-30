/**
 * LIQUIDITY² Terminal - WebSocket Management Service
 * Handles real-time data connections with automatic reconnection and error handling
 */

import { config } from '@/config/environment';

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;
export type WebSocketStatusHandler = (status: WebSocketStatus) => void;

export enum WebSocketStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
  CLOSED = 'closed',
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private statusHandlers: Set<WebSocketStatusHandler> = new Set();
  private reconnectAttempts = 0;
  private reconnectTimeoutId: number | null = null;
  private heartbeatIntervalId: number | null = null;
  private status: WebSocketStatus = WebSocketStatus.DISCONNECTED;
  private lastHeartbeat: number = 0;

  constructor(wsConfig: WebSocketConfig) {
    this.config = {
      protocols: [],
      reconnectAttempts: config.websocket.reconnectAttempts,
      reconnectDelay: config.websocket.reconnectDelay,
      heartbeatInterval: 30000, // 30 seconds
      ...wsConfig,
    };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.setStatus(WebSocketStatus.CONNECTING);

    try {
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.setStatus(WebSocketStatus.ERROR);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.clearTimeouts();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.setStatus(WebSocketStatus.CLOSED);
    this.reconnectAttempts = 0;
  }

  send(message: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    return false;
  }

  subscribe(eventType: string, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    this.eventHandlers.get(eventType)!.add(handler);
    
    return () => {
      this.eventHandlers.get(eventType)?.delete(handler);
    };
  }

  onStatusChange(handler: WebSocketStatusHandler): () => void {
    this.statusHandlers.add(handler);
    
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }

  getConnectionInfo() {
    return {
      url: this.config.url,
      status: this.status,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.config.reconnectAttempts,
      lastHeartbeat: this.lastHeartbeat,
      readyState: this.ws?.readyState,
    };
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected:', this.config.url);
      this.setStatus(WebSocketStatus.CONNECTED);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.clearTimeouts();
      
      if (event.code !== 1000 && this.reconnectAttempts < this.config.reconnectAttempts) {
        this.setStatus(WebSocketStatus.RECONNECTING);
        this.scheduleReconnect();
      } else {
        this.setStatus(WebSocketStatus.CLOSED);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.setStatus(WebSocketStatus.ERROR);
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    // Update heartbeat timestamp
    this.lastHeartbeat = Date.now();

    // Handle heartbeat messages
    if (message.type === 'heartbeat' || message.type === 'ping') {
      this.send({ type: 'pong', timestamp: Date.now() });
      return;
    }

    // Dispatch to event handlers
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('WebSocket event handler error:', error);
        }
      });
    }

    // Dispatch to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('WebSocket wildcard handler error:', error);
        }
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.setStatus(WebSocketStatus.ERROR);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.config.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimeoutId = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.lastHeartbeat = Date.now();
    
    this.heartbeatIntervalId = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  private clearTimeouts(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusHandlers.forEach(handler => {
        try {
          handler(status);
        } catch (error) {
          console.error('WebSocket status handler error:', error);
        }
      });
    }
  }
}

// Singleton instances for common connections
export class WebSocketConnections {
  private static instances: Map<string, WebSocketManager> = new Map();

  static getCoinbaseConnection(): WebSocketManager {
    const key = 'coinbase';
    if (!this.instances.has(key)) {
      this.instances.set(key, new WebSocketManager({
        url: 'wss://ws-feed.pro.coinbase.com',
      }));
    }
    return this.instances.get(key)!;
  }

  static getBinanceConnection(): WebSocketManager {
    const key = 'binance';
    if (!this.instances.has(key)) {
      this.instances.set(key, new WebSocketManager({
        url: 'wss://stream.binance.com:9443/ws/btcusdt@ticker',
      }));
    }
    return this.instances.get(key)!;
  }

  static getCustomConnection(url: string, config?: Partial<WebSocketConfig>): WebSocketManager {
    const key = url;
    if (!this.instances.has(key)) {
      this.instances.set(key, new WebSocketManager({ url, ...config }));
    }
    return this.instances.get(key)!;
  }

  static disconnectAll(): void {
    this.instances.forEach(ws => ws.disconnect());
    this.instances.clear();
  }
}