import type { Backend } from './BaseBackend';
import type { FileMetadata } from '@browser-os/schemas';

/**
 * Server-based backend (HTTP API)
 */
export class ServerBackend implements Backend {
  private baseUrl: string;

  constructor(options: { baseUrl: string }) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
  }

  private async request(method: string, path: string, body?: Uint8Array): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/octet-stream' } : {},
      body: body ? body : undefined,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  async read(path: string): Promise<Uint8Array> {
    const response = await this.request('GET', `/files${path}`);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  async write(path: string, data: Uint8Array): Promise<void> {
    await this.request('PUT', `/files${path}`, data);
  }

  async delete(path: string): Promise<void> {
    await this.request('DELETE', `/files${path}`);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.request('HEAD', `/files${path}`);
      return true;
    } catch {
      return false;
    }
  }

  async mkdir(path: string): Promise<void> {
    await this.request('POST', `/files${path}`, new Uint8Array(0));
  }

  async rmdir(path: string): Promise<void> {
    await this.request('DELETE', `/files${path}`);
  }

  async readdir(path: string): Promise<string[]> {
    const response = await this.request('GET', `/files${path}?list=true`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async stat(path: string): Promise<FileMetadata> {
    const response = await this.request('HEAD', `/files${path}`);
    const headers = response.headers;
    const now = Date.now();

    return {
      path,
      type: headers.get('Content-Type')?.includes('directory') ? 'directory' : 'file',
      size: parseInt(headers.get('Content-Length') || '0', 10),
      createdAt: parseInt(headers.get('X-Created-At') || String(now), 10),
      modifiedAt: parseInt(headers.get('X-Modified-At') || String(now), 10),
      permissions: headers.get('X-Permissions') || 'rwxrwxrwx',
    };
  }
}

