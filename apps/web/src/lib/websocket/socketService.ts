/**
 * AXIS Real-Time WebSocket Service & Simulation Fallback Ticker
 * 
 * Attempts resilient WebSocket connection to the FastAPI backend.
 * If backend WS is unreachable, transparently runs a local telemetry
 * ticker so that real-time charts, heartbeats, and metrics remain active.
 */

import { writable } from 'svelte/store';

export type SocketStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'FALLBACK_SIMULATION';

export interface TelemetryPacket {
  type: 'telemetry_tick' | 'incident_update' | 'heartbeat';
  timestamp: string;
  data: Record<string, any>;
}

type PacketHandler = (packet: TelemetryPacket) => void;

class SocketService {
  public status = writable<SocketStatus>('DISCONNECTED');
  private ws: WebSocket | null = null;
  private handlers = new Set<PacketHandler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private fallbackTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private isDestroyed = false;

  private get wsUrl(): string {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL as string;
    }
    const host = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
      ? 'localhost:8000'
      : '127.0.0.1:8000';
    return `ws://${host}/api/ws`;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  public init() {
    this.isDestroyed = false;
    this.connect();
  }

  public connect() {
    if (typeof window === 'undefined' || this.isDestroyed) return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.status.set('CONNECTING');

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.status.set('CONNECTED');
        this.reconnectAttempts = 0;
        this.stopFallbackTicker();
      };

      this.ws.onmessage = (event) => {
        try {
          const packet: TelemetryPacket = JSON.parse(event.data);
          this.notifyHandlers(packet);
        } catch (err) {
          console.warn('[AXIS WS] Packet parse warning:', err);
        }
      };

      this.ws.onerror = () => {
        // Socket error: enter fallback simulation immediately
        this.enterFallback();
      };

      this.ws.onclose = () => {
        this.enterFallback();
        this.scheduleReconnect();
      };
    } catch {
      this.enterFallback();
      this.scheduleReconnect();
    }
  }

  private enterFallback() {
    this.status.set('FALLBACK_SIMULATION');
    this.startFallbackTicker();
  }

  private startFallbackTicker() {
    if (this.fallbackTimer) return;
    this.fallbackTimer = setInterval(() => {
      if (this.isDestroyed) return;
      const packet: TelemetryPacket = {
        type: 'telemetry_tick',
        timestamp: new Date().toISOString(),
        data: {
          satellitesOnline: 12,
          groundSensors: 1480 + Math.floor(Math.random() * 5),
          packetLatencyMs: 8 + Math.floor(Math.random() * 4)
        }
      };
      this.notifyHandlers(packet);
    }, 4000);
  }

  private stopFallbackTicker() {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.isDestroyed || this.reconnectTimer) return;
    // Exponential backoff capped at 30 seconds
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30_000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  public subscribe(handler: PacketHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  private notifyHandlers(packet: TelemetryPacket) {
    this.handlers.forEach((h) => {
      try {
        h(packet);
      } catch (err) {
        console.error('[AXIS WS Handler Error]:', err);
      }
    });
  }

  public send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }

  public destroy() {
    this.isDestroyed = true;
    this.stopFallbackTicker();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.status.set('DISCONNECTED');
  }
}

export const socketService = new SocketService();
