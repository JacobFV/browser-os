import { Capability } from '@browser-os/core';

export interface NetworkRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit;
}

export interface NetworkResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
  json(): Promise<any>;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

class NetworkManager {
  private permissions: Map<string, Set<Capability>> = new Map();
  
  grantCapability(appId: string, capability: Capability): void {
    if (!this.permissions.has(appId)) {
      this.permissions.set(appId, new Set());
    }
    this.permissions.get(appId)!.add(capability);
  }
  
  revokeCapability(appId: string, capability: Capability): void {
    const perms = this.permissions.get(appId);
    if (perms) {
      perms.delete(capability);
    }
  }
  
  hasCapability(appId: string, capability: Capability): boolean {
    const perms = this.permissions.get(appId);
    return perms ? perms.has(capability) : false;
  }
  
  async fetch(appId: string, request: NetworkRequest): Promise<NetworkResponse> {
    if (!this.hasCapability(appId, 'net.fetch')) {
      throw new Error(`App ${appId} does not have net.fetch capability`);
    }
    
    const response = await globalThis.fetch(request.url, {
      method: request.method || 'GET',
      headers: request.headers,
      body: request.body,
    });
    
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body: response.body,
      json: () => response.json(),
      text: () => response.text(),
      arrayBuffer: () => response.arrayBuffer(),
    };
  }
  
  createWebSocket(appId: string, url: string): WebSocket {
    if (!this.hasCapability(appId, 'net.ws')) {
      throw new Error(`App ${appId} does not have net.ws capability`);
    }
    
    return new WebSocket(url);
  }
}

export const networkManager = new NetworkManager();

export function grantNetworkCapability(appId: string, capability: Capability): void {
  networkManager.grantCapability(appId, capability);
}

export function revokeNetworkCapability(appId: string, capability: Capability): void {
  networkManager.revokeCapability(appId, capability);
}

export function hasNetworkCapability(appId: string, capability: Capability): boolean {
  return networkManager.hasCapability(appId, capability);
}

export async function networkFetch(appId: string, request: NetworkRequest): Promise<NetworkResponse> {
  return networkManager.fetch(appId, request);
}

export function createNetworkWebSocket(appId: string, url: string): WebSocket {
  return networkManager.createWebSocket(appId, url);
}
