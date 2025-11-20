import express from 'express';
import { createServer, Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';
import { TelemetryService } from './TelemetryService';
import { ServiceRegistry } from './ServiceRegistry';
import { WebSocketHandler } from './WebSocketHandler';
import { ChessService } from './services/chess/ChessService';
import { createTelemetryRoutes } from './routes/telemetry';
import { createProxyRoutes } from './routes/proxy';
import { createChessRoutes } from './routes/chess';
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
  private chessService: ChessService;
  private wsHandler: WebSocketHandler;
  private options: Required<ServerOptions>;

  constructor(options: ServerOptions = {}) {
    this.options = {
      port: options.port ?? 8000,
      host: options.host ?? '0.0.0.0',
      pingInterval: options.pingInterval ?? 30000,
    };

    this.app = express();
    this.telemetryService = new TelemetryService();
    this.serviceRegistry = new ServiceRegistry();
    this.chessService = new ChessService();
    this.wsHandler = new WebSocketHandler({
      telemetryService: this.telemetryService,
      serviceRegistry: this.serviceRegistry,
      chessService: this.chessService,
      pingInterval: this.options.pingInterval,
    });

    // Register services
    this.serviceRegistry.register({
      name: 'proxy',
      version: '1.0.0',
      enabled: true,
    });

    this.serviceRegistry.register({
      name: 'chess',
      version: '1.0.0',
      enabled: true,
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

    // Proxy routes
    this.app.use('/proxy', createProxyRoutes());

    // Chess routes
    this.app.use('/api/chess', createChessRoutes(this.chessService));

    // Service routes
    this.app.get('/services', (req, res) => {
      const services = this.serviceRegistry.getEnabled();
      res.json(services);
    });
  }

  /**
   * Get chess service
   */
  getChessService(): ChessService {
    return this.chessService;
  }
}

