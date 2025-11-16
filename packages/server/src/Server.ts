import express from 'express';
import { createServer, Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';
import { TelemetryService } from './TelemetryService';
import { ServiceRegistry } from './ServiceRegistry';
import { WebSocketHandler } from './WebSocketHandler';
import { createTelemetryRoutes } from './routes/telemetry';
import type { ServerOptions } from './types';

/**
 * Main server class
 */
export class Server {
  private app: express.Application;
  private httpServer: HttpServer | null = null;
  private wss: WebSocketServer | null = null;
  private telemetryService: TelemetryService;
  private serviceRegistry: ServiceRegistry;
  private wsHandler: WebSocketHandler;
  private options: Required<ServerOptions>;

  constructor(options: ServerOptions = {}) {
    this.options = {
      port: options.port ?? 3000,
      host: options.host ?? '0.0.0.0',
      pingInterval: options.pingInterval ?? 30000,
    };

    this.app = express();
    this.telemetryService = new TelemetryService();
    this.serviceRegistry = new ServiceRegistry();
    this.wsHandler = new WebSocketHandler({
      telemetryService: this.telemetryService,
      serviceRegistry: this.serviceRegistry,
      pingInterval: this.options.pingInterval,
    });

    this.setupRoutes();
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.httpServer = createServer(this.app);
        this.httpServer.listen(this.options.port, this.options.host, () => {
          console.log(
            `[Server] HTTP server listening on ${this.options.host}:${this.options.port}`
          );

          // Setup WebSocket server
          this.wss = new WebSocketServer({ server: this.httpServer! });
          this.wss.on('connection', (ws) => {
            this.wsHandler.handleConnection(ws);
          });
          this.wsHandler.startPingInterval();
          console.log('[Server] WebSocket server started');

          resolve();
        });

        this.httpServer.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.wsHandler.stopPingInterval();

      if (this.wss) {
        this.wss.close(() => {
          console.log('[Server] WebSocket server closed');
        });
        this.wss = null;
      }

      if (this.httpServer) {
        this.httpServer.close(() => {
          console.log('[Server] HTTP server closed');
          resolve();
        });
        this.httpServer = null;
      } else {
        resolve();
      }
    });
  }

  /**
   * Get telemetry service
   */
  getTelemetryService(): TelemetryService {
    return this.telemetryService;
  }

  /**
   * Get service registry
   */
  getServiceRegistry(): ServiceRegistry {
    return this.serviceRegistry;
  }

  /**
   * Get WebSocket handler
   */
  getWebSocketHandler(): WebSocketHandler {
    return this.wsHandler;
  }

  private setupRoutes(): void {
    // JSON middleware
    this.app.use(express.json());

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });

    // Telemetry routes
    this.app.use('/telemetry', createTelemetryRoutes(this.telemetryService));

    // Service routes
    this.app.get('/services', (req, res) => {
      const services = this.serviceRegistry.getEnabled();
      res.json(services);
    });
  }
}

