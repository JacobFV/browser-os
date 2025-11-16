import type { EventBus } from '@browser-os/events';

export interface NetworkManagerOptions {
  eventBus?: EventBus;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  body?: string | Uint8Array;
  timeout?: number;
  credentials?: 'omit' | 'same-origin' | 'include';
  mode?: 'cors' | 'no-cors' | 'same-origin';
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
}

export interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string | Uint8Array | null;
  ok: boolean;
  url: string;
}

/**
 * Network Manager for HTTP requests
 */
export class NetworkManager {
  private eventBus?: EventBus;

  constructor(options?: NetworkManagerOptions) {
    this.eventBus = options?.eventBus;
  }

  /**
   * Make HTTP request
   */
  async request(url: string, options?: RequestOptions): Promise<Response> {
    try {
      // Convert Uint8Array body to ArrayBuffer for fetch
      let body: BodyInit | null | undefined;
      if (options?.body === undefined) {
        body = undefined;
      } else if (typeof options.body === 'string') {
        body = options.body;
      } else if (options.body instanceof Uint8Array) {
        // Create a new ArrayBuffer to avoid type issues with SharedArrayBuffer
        const buffer = new ArrayBuffer(options.body.length);
        new Uint8Array(buffer).set(options.body);
        body = buffer;
      } else {
        body = options.body;
      }

      const fetchOptions: RequestInit = {
        method: options?.method ?? 'GET',
        headers: options?.headers,
        body,
        credentials: options?.credentials,
        mode: options?.mode,
        cache: options?.cache,
      };

      // Handle timeout
      let controller: AbortController | undefined;
      let timeoutId: number | undefined;
      if (options?.timeout) {
        controller = new AbortController();
        timeoutId = window.setTimeout(() => controller!.abort(), options.timeout);
        fetchOptions.signal = controller.signal;
      }

      try {
        const response = await fetch(url, fetchOptions);
        
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Read response body
        const contentType = response.headers.get('content-type') ?? '';
        let body: string | Uint8Array | null = null;

        if (contentType.includes('application/json') || contentType.includes('text/')) {
          body = await response.text();
        } else {
          const arrayBuffer = await response.arrayBuffer();
          body = new Uint8Array(arrayBuffer);
        }

        // Convert headers to object
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        const result: Response = {
          status: response.status,
          statusText: response.statusText,
          headers,
          body,
          ok: response.ok,
          url: response.url,
        };

        this.eventBus?.emit('network:request', { url, options, response: result }, { source: 'network-manager' });

        return result;
      } catch (error) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        throw error;
      }
    } catch (error) {
      this.eventBus?.emit('network:error', { url, options, error }, { source: 'network-manager' });
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<Response> {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(url: string, body?: string | Uint8Array, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<Response> {
    return this.request(url, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put(url: string, body?: string | Uint8Array, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<Response> {
    return this.request(url, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<Response> {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

