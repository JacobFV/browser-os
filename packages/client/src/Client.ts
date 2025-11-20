import { EventBus } from '@browser-os/events';
import type { Kernel } from '@browser-os/kernel';
import { ConnectionManager } from './ConnectionManager';
import { TelemetryCollector } from './TelemetryCollector';
import { ServiceRegistry } from './ServiceRegistry';
import { MessagingClient } from './MessagingClient';
import type { ClientOptions, ClientMetadata, TelemetryData, ServiceDefinition } from './types';

/**
 * Main client class for connecting to remote server
 */
export class Client {
  private connectionManager: ConnectionManager;
  private telemetryCollector: TelemetryCollector;
  private serviceRegistry: ServiceRegistry;
  private messagingClient: MessagingClient | null = null;
  private clientId: string;
  private telemetryTimer: NodeJS.Timeout | null = null;
  private options: Required<ClientOptions>;

  constructor(
    private eventBus: EventBus,
    private kernel: Kernel,
    options: ClientOptions
  ) {
    this.options = {
      reconnectInterval: options.reconnectInterval ?? 3000,
      reconnectMaxAttempts: options.reconnectMaxAttempts ?? Infinity,
      telemetryInterval: options.telemetryInterval ?? 5000,
      serverUrl: options.serverUrl,
    };

    this.clientId = this.generateClientId();
    this.connectionManager = new ConnectionManager(this.options);
    this.telemetryCollector = new TelemetryCollector(eventBus, kernel);
    this.serviceRegistry = new ServiceRegistry();
    this.messagingClient = new MessagingClient({
      connectionManager: this.connectionManager,
      clientId: this.clientId,
    });

    // Handle incoming messages
    this.connectionManager.onMessage((message) => {
      this.handleMessage(message);
    });
  }

  /**
   * Connect to server
   */
  async connect(): Promise<void> {
    await this.connectionManager.connect();
    await this.sendConnect();
    this.startTelemetryCollection();
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.stopTelemetryCollection();
    this.telemetryCollector.stop();
    this.connectionManager.disconnect();
  }

  /**
   * Get connection state
   */
  getConnectionState(): string {
    return this.connectionManager.getState();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionManager.isConnected();
  }

  /**
   * Register a service
   */
  registerService(service: ServiceDefinition): void {
    this.serviceRegistry.register(service);
  }

  /**
   * Get service registry
   */
  getServiceRegistry(): ServiceRegistry {
    return this.serviceRegistry;
  }

  /**
   * Get connection manager
   */
  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  /**
   * Get messaging client
   */
  getMessagingClient(): MessagingClient | null {
    return this.messagingClient;
  }

  /**
   * Get client ID
   */
  getClientId(): string {
    return this.clientId;
  }

  private async sendConnect(): Promise<void> {
    const metadata: ClientMetadata = {
      clientId: this.clientId,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };

    this.connectionManager.send('client:connect', metadata);
  }

  private handleMessage(message: { type: string; payload?: unknown }): void {
    switch (message.type) {
      case 'server:ping':
        this.connectionManager.send('client:pong');
        break;

      case 'server:service:register':
        if (message.payload && typeof message.payload === 'object') {
          const services = Array.isArray(message.payload)
            ? message.payload
            : [message.payload];
          services.forEach((service: unknown) => {
            if (this.isServiceDefinition(service)) {
              this.serviceRegistry.register(service);
            }
          });
        }
        break;

      default:
        // Emit unknown messages as events for extensibility
        this.eventBus.emit(`client:message:${message.type}`, message.payload, {
          source: 'client',
        });
    }
  }

  private startTelemetryCollection(): void {
    this.telemetryCollector.start();
    this.collectAndSendTelemetry();

    this.telemetryTimer = setInterval(() => {
      this.collectAndSendTelemetry();
    }, this.options.telemetryInterval);
  }

  private stopTelemetryCollection(): void {
    if (this.telemetryTimer) {
      clearInterval(this.telemetryTimer);
      this.telemetryTimer = null;
    }
  }

  private async collectAndSendTelemetry(): Promise<void> {
    if (!this.connectionManager.isConnected()) {
      return;
    }

    try {
      const telemetry = await this.telemetryCollector.collect();
      this.connectionManager.send('client:telemetry', telemetry);
    } catch (error) {
      console.error('[Client] Failed to collect telemetry:', error);
    }
  }

  private generateClientId(): string {
    // Generate a unique client ID
    const stored = localStorage.getItem('browser-os-client-id');
    if (stored) {
      return stored;
    }

    const id = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('browser-os-client-id', id);
    return id;
  }

  private isServiceDefinition(obj: unknown): obj is ServiceDefinition {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'name' in obj &&
      'version' in obj &&
      'enabled' in obj &&
      typeof (obj as ServiceDefinition).name === 'string' &&
      typeof (obj as ServiceDefinition).version === 'string' &&
      typeof (obj as ServiceDefinition).enabled === 'boolean'
    );
  }
}

