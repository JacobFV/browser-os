export interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function fetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = options.timeout || 30000;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await window.fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<string, (data: any) => void> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (error) => reject(error);
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handler = this.handlers.get(data.type);
          if (handler) {
            handler(data.payload);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };
    });
  }

  send(type: string, payload: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  on(type: string, handler: (data: any) => void): void {
    this.handlers.set(type, handler);
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private handlers: Map<string, (data: any) => void> = new Map();

  connect(url: string): void {
    this.eventSource = new EventSource(url);
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handler = this.handlers.get(data.type);
        if (handler) {
          handler(data.payload);
        }
      } catch (error) {
        console.error('SSE message error:', error);
      }
    };
  }

  on(type: string, handler: (data: any) => void): void {
    this.handlers.set(type, handler);
  }

  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

