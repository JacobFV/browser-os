import { WebSocket } from 'ws';
import { TelemetryService } from './TelemetryService';
import { ServiceRegistry } from './ServiceRegistry';
import { ChessService } from './services/chess/ChessService';
import { MessageService } from './services/MessageService';
import type { WebSocketMessage, ClientMetadata, TelemetryData, Message, Conversation } from './types';

export interface WebSocketHandlerOptions {
  telemetryService: TelemetryService;
  serviceRegistry: ServiceRegistry;
  chessService?: ChessService;
  messageService?: MessageService;
  pingInterval?: number;
}

/**
 * Handles WebSocket connections and messages
 */
export class WebSocketHandler {
  private clients: Map<string, WebSocket> = new Map();
  private wsToClientId: Map<WebSocket, string> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(private options: WebSocketHandlerOptions) {}

  /**
   * Handle a new WebSocket connection
   */
  handleConnection(ws: WebSocket): void {
    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('[WebSocketHandler] Failed to parse message:', error);
      }
    });

    ws.on('close', () => {
      const clientId = this.wsToClientId.get(ws);
      if (clientId) {
        this.clients.delete(clientId);
        this.wsToClientId.delete(ws);
        this.options.telemetryService.unregisterClient(clientId);
        
        // Update presence if message service is available
        if (this.options.messageService) {
          this.options.messageService.updatePresence(clientId, 'offline');
          this.broadcast('presence:changed', { userId: clientId, status: 'offline' });
        }
      }
    });

    ws.on('error', (error) => {
      console.error('[WebSocketHandler] WebSocket error:', error);
      const clientId = this.wsToClientId.get(ws);
      if (clientId) {
        this.clients.delete(clientId);
        this.wsToClientId.delete(ws);
        this.options.telemetryService.unregisterClient(clientId);
      }
    });
  }

  /**
   * Start ping interval to keep connections alive
   */
  startPingInterval(): void {
    const interval = this.options.pingInterval ?? 30000;
    this.pingInterval = setInterval(() => {
      this.clients.forEach((ws, clientId) => {
        if (ws.readyState === WebSocket.OPEN) {
          this.send(ws, 'server:ping');
          this.options.telemetryService.updateClientLastSeen(clientId);
        } else {
          // Remove dead connections
          this.clients.delete(clientId);
          this.options.telemetryService.unregisterClient(clientId);
        }
      });
    }, interval);
  }

  /**
   * Stop ping interval
   */
  stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Send message to a specific client
   */
  sendToClient(clientId: string, type: string, payload?: unknown): void {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      this.send(ws, type, payload);
    }
  }

  /**
   * Broadcast message to all clients
   */
  broadcast(type: string, payload?: unknown): void {
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        this.send(ws, type, payload);
      }
    });
  }

  /**
   * Get connected client count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
    // Handle chess messages if chess service is available
    if (this.options.chessService && message.type.startsWith('chess:')) {
      this.handleChessMessage(ws, message);
      return;
    }

    // Handle messaging messages if message service is available
    if (this.options.messageService && message.type.startsWith('message:') || 
        message.type.startsWith('conversation:') || 
        message.type.startsWith('presence:') || 
        message.type.startsWith('typing:')) {
      this.handleMessagingMessage(ws, message);
      return;
    }

    switch (message.type) {
      case 'client:connect':
        this.handleConnect(ws, message.payload as ClientMetadata);
        break;

      case 'client:telemetry':
        this.handleTelemetry(ws, message.payload as TelemetryData);
        break;

      case 'client:pong':
        // Client responded to ping, connection is alive
        break;

      default:
        console.warn('[WebSocketHandler] Unknown message type:', message.type);
    }
  }

  private handleChessMessage(ws: WebSocket, message: WebSocketMessage): void {
    if (!this.options.chessService) return;

    const clientId = this.wsToClientId.get(ws);
    if (!clientId) {
      this.send(ws, 'chess:error', { message: 'Not connected' });
      return;
    }

    const payload = message.payload as any;

    switch (message.type) {
      case 'chess:join': {
        const { gameId, playerId } = payload;
        const player = {
          id: playerId || clientId,
          ws,
          color: 'w' as const,
          name: payload.name,
        };

        let room = this.options.chessService.getRoom(gameId);
        
        if (!room) {
          // Create new room
          room = this.options.chessService.createRoom(player);
          this.send(ws, 'chess:joined', {
            gameId: room.getId(),
            color: 'w',
          });
        } else if (!room.isFull()) {
          // Join existing room
          const blackPlayer = {
            ...player,
            color: 'b' as const,
          };
          room.addBlackPlayer(blackPlayer);
          this.send(ws, 'chess:joined', {
            gameId: room.getId(),
            color: 'b',
          });
        } else {
          this.send(ws, 'chess:error', { message: 'Room is full' });
        }
        break;
      }

      case 'chess:move': {
        const { gameId, move } = payload;
        const room = this.options.chessService.getRoom(gameId);
        
        if (!room) {
          this.send(ws, 'chess:error', { message: 'Game not found' });
          return;
        }

        const success = room.handleMove(clientId, move);
        if (!success) {
          this.send(ws, 'chess:error', { message: 'Invalid move' });
        }
        break;
      }

      case 'chess:chat': {
        const { gameId, message: chatMessage } = payload;
        const room = this.options.chessService.getRoom(gameId);
        
        if (!room) {
          this.send(ws, 'chess:error', { message: 'Game not found' });
          return;
        }

        room.handleChat(clientId, chatMessage);
        break;
      }

      case 'chess:resign': {
        const { gameId } = payload;
        const room = this.options.chessService.getRoom(gameId);
        
        if (!room) {
          this.send(ws, 'chess:error', { message: 'Game not found' });
          return;
        }

        room.handleResign(clientId);
        break;
      }

      default:
        console.warn('[WebSocketHandler] Unknown chess message type:', message.type);
    }
  }

  private handleConnect(ws: WebSocket, metadata: ClientMetadata): void {
    const clientId = metadata.clientId;
    this.clients.set(clientId, ws);
    this.wsToClientId.set(ws, clientId);
    this.options.telemetryService.registerClient(clientId, metadata);

    // Update presence if message service is available
    if (this.options.messageService) {
      this.options.messageService.updatePresence(clientId, 'online');
    }

    // Send available services to client
    const services = this.options.serviceRegistry.getEnabled();
    this.send(ws, 'server:service:register', services);

    console.log(`[WebSocketHandler] Client connected: ${clientId}`);
  }

  private handleTelemetry(ws: WebSocket, data: TelemetryData): void {
    const clientId = this.wsToClientId.get(ws);
    if (!clientId) {
      console.warn('[WebSocketHandler] Received telemetry from unknown client');
      return;
    }

    this.options.telemetryService.storeTelemetry(clientId, data);
  }

  private handleMessagingMessage(ws: WebSocket, message: WebSocketMessage): void {
    if (!this.options.messageService) return;

    const clientId = this.wsToClientId.get(ws);
    if (!clientId) {
      this.send(ws, 'message:error', { message: 'Not connected' });
      return;
    }

    const payload = message.payload as any;

    switch (message.type) {
      case 'message:send': {
        const { conversationId, content, type, attachments, replyTo } = payload;
        
        if (!conversationId || !content) {
          this.send(ws, 'message:error', { message: 'conversationId and content required' });
          return;
        }

        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newMessage: Message = {
          id: messageId,
          conversationId,
          senderId: clientId,
          content,
          timestamp: Date.now(),
          type: type || 'text',
          attachments,
          replyTo,
          status: 'sent',
        };

        this.options.messageService.sendMessage(newMessage).then((sentMessage) => {
          // Confirm to sender
          this.send(ws, 'message:sent', { messageId: sentMessage.id, timestamp: sentMessage.timestamp });

          // Deliver to recipients
          const conversation = this.options.messageService!.getConversation(conversationId);
          if (conversation) {
            conversation.participants.forEach((participantId) => {
              if (participantId !== clientId) {
                const recipientWs = this.clients.get(participantId);
                if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                  this.send(recipientWs, 'message:received', sentMessage);
                }
              }
            });

            // Broadcast conversation update
            conversation.participants.forEach((participantId) => {
              const participantWs = this.clients.get(participantId);
              if (participantWs && participantWs.readyState === WebSocket.OPEN) {
                this.send(participantWs, 'conversation:updated', conversation);
              }
            });
          }
        });
        break;
      }

      case 'conversation:list': {
        const conversations = this.options.messageService.getConversations(clientId);
        this.send(ws, 'conversation:list', conversations);
        break;
      }

      case 'conversation:create': {
        const { participants } = payload;
        if (!participants || !Array.isArray(participants) || participants.length === 0) {
          this.send(ws, 'conversation:error', { message: 'participants array required' });
          return;
        }

        // Ensure current user is included
        const allParticipants = [...new Set([clientId, ...participants])];
        const conversation = this.options.messageService.createConversation(allParticipants);
        
        // Notify all participants
        allParticipants.forEach((participantId) => {
          const participantWs = this.clients.get(participantId);
          if (participantWs && participantWs.readyState === WebSocket.OPEN) {
            this.send(participantWs, 'conversation:created', conversation);
          }
        });
        break;
      }

      case 'message:get': {
        const { conversationId, limit } = payload;
        if (!conversationId) {
          this.send(ws, 'message:error', { message: 'conversationId required' });
          return;
        }

        const messages = this.options.messageService.getMessages(conversationId, limit);
        this.send(ws, 'message:history', { conversationId, messages });
        break;
      }

      case 'presence:update': {
        const { status } = payload;
        if (status !== 'online' && status !== 'offline') {
          this.send(ws, 'presence:error', { message: 'Invalid status' });
          return;
        }

        this.options.messageService.updatePresence(clientId, status);
        
        // Broadcast presence change to all clients
        this.broadcast('presence:changed', { userId: clientId, status });
        break;
      }

      case 'typing:start': {
        const { conversationId } = payload;
        if (!conversationId) {
          return;
        }

        this.options.messageService.setTyping(conversationId, clientId, true);
        
        // Broadcast typing indicator
        const conversation = this.options.messageService.getConversation(conversationId);
        if (conversation) {
          conversation.participants.forEach((participantId) => {
            if (participantId !== clientId) {
              const participantWs = this.clients.get(participantId);
              if (participantWs && participantWs.readyState === WebSocket.OPEN) {
                this.send(participantWs, 'typing:indicator', {
                  conversationId,
                  userId: clientId,
                  isTyping: true,
                });
              }
            }
          });
        }
        break;
      }

      case 'typing:stop': {
        const { conversationId } = payload;
        if (!conversationId) {
          return;
        }

        this.options.messageService.setTyping(conversationId, clientId, false);
        
        // Broadcast typing indicator
        const conversation = this.options.messageService.getConversation(conversationId);
        if (conversation) {
          conversation.participants.forEach((participantId) => {
            if (participantId !== clientId) {
              const participantWs = this.clients.get(participantId);
              if (participantWs && participantWs.readyState === WebSocket.OPEN) {
                this.send(participantWs, 'typing:indicator', {
                  conversationId,
                  userId: clientId,
                  isTyping: false,
                });
              }
            }
          });
        }
        break;
      }

      default:
        console.warn('[WebSocketHandler] Unknown messaging message type:', message.type);
    }
  }

  private send(ws: WebSocket, type: string, payload?: unknown): void {
    const message: WebSocketMessage = { type, payload };
    ws.send(JSON.stringify(message));
  }
}

