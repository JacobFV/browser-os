import type { ConnectionManager } from './ConnectionManager';
import type { Message, Conversation } from './types';

export interface MessagingClientOptions {
  connectionManager: ConnectionManager;
  clientId: string;
}

/**
 * Client-side messaging integration
 */
export class MessagingClient {
  private messageHandlers: Set<(message: Message) => void> = new Set();
  private conversationUpdateHandlers: Set<(conversation: Conversation) => void> = new Set();
  private typingHandlers: Set<(data: { conversationId: string; userId: string; isTyping: boolean }) => void> = new Set();
  private pendingRequests: Map<string, { resolve: (value: unknown) => void; reject: (error: Error) => void }> = new Map();

  constructor(private options: MessagingClientOptions) {
    // Listen for messaging-related messages
    this.setupMessageHandlers();
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'file' = 'text',
    attachments?: Array<{ id: string; type: string; url: string; name: string; size: number }>,
    replyTo?: string
  ): Promise<Message> {
    return new Promise((resolve, reject) => {
      const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Set up one-time handler for message:sent confirmation
      const sentHandler = (payload: unknown) => {
        const data = payload as { messageId: string; timestamp: number };
        // We'll resolve with a partial message, the full message will come via message:received
        resolve({
          id: data.messageId,
          conversationId,
          senderId: this.options.clientId,
          content,
          timestamp: data.timestamp,
          type,
          attachments,
          replyTo,
          status: 'sent',
        } as Message);
      };

      // Listen for sent confirmation
      const unsubscribe = this.options.connectionManager.onMessage((message) => {
        if (message.type === 'message:sent') {
          sentHandler(message.payload);
          unsubscribe();
        }
      });

      // Send message
      this.options.connectionManager.send('message:send', {
        conversationId,
        content,
        type,
        attachments,
        replyTo,
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        unsubscribe();
        reject(new Error('Message send timeout'));
      }, 10000);
    });
  }

  /**
   * Get conversations
   */
  async getConversations(): Promise<Conversation[]> {
    return new Promise((resolve, reject) => {
      const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const handler = (payload: unknown) => {
        const conversations = payload as Conversation[];
        resolve(conversations);
      };

      const unsubscribe = this.options.connectionManager.onMessage((message) => {
        if (message.type === 'conversation:list') {
          handler(message.payload);
          unsubscribe();
        }
      });

      this.options.connectionManager.send('conversation:list', {});

      setTimeout(() => {
        unsubscribe();
        reject(new Error('Get conversations timeout'));
      }, 10000);
    });
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, limit?: number): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      const handler = (payload: unknown) => {
        const data = payload as { conversationId: string; messages: Message[] };
        if (data.conversationId === conversationId) {
          resolve(data.messages);
        }
      };

      const unsubscribe = this.options.connectionManager.onMessage((message) => {
        if (message.type === 'message:history') {
          handler(message.payload);
          unsubscribe();
        }
      });

      this.options.connectionManager.send('message:get', { conversationId, limit });

      setTimeout(() => {
        unsubscribe();
        reject(new Error('Get messages timeout'));
      }, 10000);
    });
  }

  /**
   * Create a new conversation
   */
  async createConversation(participants: string[]): Promise<Conversation> {
    return new Promise((resolve, reject) => {
      const handler = (payload: unknown) => {
        const conversation = payload as Conversation;
        resolve(conversation);
      };

      const unsubscribe = this.options.connectionManager.onMessage((message) => {
        if (message.type === 'conversation:created') {
          handler(message.payload);
          unsubscribe();
        }
      });

      this.options.connectionManager.send('conversation:create', { participants });

      setTimeout(() => {
        unsubscribe();
        reject(new Error('Create conversation timeout'));
      }, 10000);
    });
  }

  /**
   * Update presence status
   */
  updatePresence(status: 'online' | 'offline'): void {
    this.options.connectionManager.send('presence:update', { status });
  }

  /**
   * Set typing indicator
   */
  setTyping(conversationId: string, isTyping: boolean): void {
    if (isTyping) {
      this.options.connectionManager.send('typing:start', { conversationId });
    } else {
      this.options.connectionManager.send('typing:stop', { conversationId });
    }
  }

  /**
   * Register message handler
   */
  onMessage(callback: (message: Message) => void): () => void {
    this.messageHandlers.add(callback);
    return () => {
      this.messageHandlers.delete(callback);
    };
  }

  /**
   * Register conversation update handler
   */
  onConversationUpdate(callback: (conversation: Conversation) => void): () => void {
    this.conversationUpdateHandlers.add(callback);
    return () => {
      this.conversationUpdateHandlers.delete(callback);
    };
  }

  /**
   * Register typing indicator handler
   */
  onTyping(callback: (data: { conversationId: string; userId: string; isTyping: boolean }) => void): () => void {
    this.typingHandlers.add(callback);
    return () => {
      this.typingHandlers.delete(callback);
    };
  }

  /**
   * Setup message handlers for incoming messages
   */
  private setupMessageHandlers(): void {
    this.options.connectionManager.onMessage((message) => {
      switch (message.type) {
        case 'message:received':
          const receivedMessage = message.payload as Message;
          this.messageHandlers.forEach((handler) => {
            try {
              handler(receivedMessage);
            } catch (error) {
              console.error('[MessagingClient] Error in message handler:', error);
            }
          });
          break;

        case 'conversation:updated':
        case 'conversation:created':
          const conversation = message.payload as Conversation;
          this.conversationUpdateHandlers.forEach((handler) => {
            try {
              handler(conversation);
            } catch (error) {
              console.error('[MessagingClient] Error in conversation update handler:', error);
            }
          });
          break;

        case 'presence:changed':
          // Can be handled by the app if needed
          break;

        case 'typing:indicator':
          const typingData = message.payload as { conversationId: string; userId: string; isTyping: boolean };
          this.typingHandlers.forEach((handler) => {
            try {
              handler(typingData);
            } catch (error) {
              console.error('[MessagingClient] Error in typing handler:', error);
            }
          });
          break;
      }
    });
  }
}

