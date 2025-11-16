import type { NetworkManager } from '@browser-os/network';
import type { SyscallHandler } from '../types';

export function createNetworkSyscalls(networkManager: NetworkManager): Record<string, SyscallHandler> {
  return {
    'network.request': async (args) => {
      const url = args.url as string;
      const options = args.options as {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
        headers?: Record<string, string>;
        body?: string | number[];
        timeout?: number;
        credentials?: 'omit' | 'same-origin' | 'include';
        mode?: 'cors' | 'no-cors' | 'same-origin';
        cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
      } | undefined;

      if (!url) {
        throw new Error('url required');
      }

      // Convert body array to Uint8Array if needed
      let requestBody: string | Uint8Array | undefined;
      if (options?.body) {
        if (Array.isArray(options.body)) {
          requestBody = new Uint8Array(options.body);
        } else {
          requestBody = options.body;
        }
      }

      const requestOptions = options
        ? { ...options, body: requestBody }
        : undefined;

      const response = await networkManager.request(url, requestOptions);

      // Convert Uint8Array body to array for serialization
      const serializableBody = response.body instanceof Uint8Array
        ? Array.from(response.body)
        : response.body;

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: serializableBody,
        ok: response.ok,
        url: response.url,
      };
    },

    'network.get': async (args) => {
      const url = args.url as string;
      const options = args.options as {
        headers?: Record<string, string>;
        timeout?: number;
        credentials?: 'omit' | 'same-origin' | 'include';
        mode?: 'cors' | 'no-cors' | 'same-origin';
        cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
      } | undefined;

      if (!url) {
        throw new Error('url required');
      }

      const response = await networkManager.get(url, options);

      // Convert Uint8Array body to array for serialization
      const serializableBody = response.body instanceof Uint8Array
        ? Array.from(response.body)
        : response.body;

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: serializableBody,
        ok: response.ok,
        url: response.url,
      };
    },

    'network.post': async (args) => {
      const url = args.url as string;
      const body = args.body as string | number[] | undefined;
      const options = args.options as {
        headers?: Record<string, string>;
        timeout?: number;
        credentials?: 'omit' | 'same-origin' | 'include';
        mode?: 'cors' | 'no-cors' | 'same-origin';
      } | undefined;

      if (!url) {
        throw new Error('url required');
      }

      // Convert body array to Uint8Array if needed
      const requestBody = Array.isArray(body) ? new Uint8Array(body) : body;

      const response = await networkManager.post(url, requestBody, options);

      // Convert Uint8Array body to array for serialization
      const serializableBody = response.body instanceof Uint8Array
        ? Array.from(response.body)
        : response.body;

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: serializableBody,
        ok: response.ok,
        url: response.url,
      };
    },
  };
}

