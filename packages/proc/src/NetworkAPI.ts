/**
 * Network API for processes to make HTTP requests
 */

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
 * Network API factory
 */
export class NetworkAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Make HTTP request
   */
  async request(url: string, options?: RequestOptions): Promise<Response> {
    // Convert Uint8Array body to array for serialization
    const serializableOptions = options ? { ...options } : undefined;
    let serializableBody: string | number[] | undefined;
    if (serializableOptions?.body) {
      if (serializableOptions.body instanceof Uint8Array) {
        serializableBody = Array.from(serializableOptions.body);
      } else {
        serializableBody = serializableOptions.body;
      }
    }
    const serializableOptionsForSyscall = serializableOptions
      ? { ...serializableOptions, body: serializableBody }
      : undefined;

    const result = await this.syscall('network.request', { url, options: serializableOptionsForSyscall }) as {
      status: number;
      statusText: string;
      headers: Record<string, string>;
      body: string | number[] | null;
      ok: boolean;
      url: string;
    };

    // Convert array body back to Uint8Array
    const body = Array.isArray(result.body) ? new Uint8Array(result.body) : result.body;

    return {
      ...result,
      body,
    };
  }

  /**
   * GET request
   */
  async get(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<Response> {
    const result = await this.syscall('network.get', { url, options }) as {
      status: number;
      statusText: string;
      headers: Record<string, string>;
      body: string | number[] | null;
      ok: boolean;
      url: string;
    };

    // Convert array body back to Uint8Array
    const body = Array.isArray(result.body) ? new Uint8Array(result.body) : result.body;

    return {
      ...result,
      body,
    };
  }

  /**
   * POST request
   */
  async post(url: string, body?: string | Uint8Array, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<Response> {
    // Convert Uint8Array body to array for serialization
    const serializableBody = body instanceof Uint8Array ? Array.from(body) : body;

    const result = await this.syscall('network.post', { url, body: serializableBody, options }) as {
      status: number;
      statusText: string;
      headers: Record<string, string>;
      body: string | number[] | null;
      ok: boolean;
      url: string;
    };

    // Convert array body back to Uint8Array
    const responseBody = Array.isArray(result.body) ? new Uint8Array(result.body) : result.body;

    return {
      ...result,
      body: responseBody,
    };
  }
}

