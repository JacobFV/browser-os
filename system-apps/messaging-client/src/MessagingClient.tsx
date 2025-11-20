import React, { useState, useEffect, useCallback } from 'react';
import { ConnectionManager, MessagingClient as MessagingClientClass } from '@browser-os/client';
import { EventBus } from '@browser-os/events';
import { ConversationList } from './components/ConversationList';
import { ConversationHeader } from './components/ConversationHeader';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { ConnectionStatus } from './components/ConnectionStatus';
import { useMessaging } from './hooks/useMessaging';
import { useNotifications } from './hooks/useNotifications';
import { MessagingStorage } from './utils/storage';
import type { Conversation } from './types';
import './MessagingClient.css';

export interface MessagingClientProps {
  windowId?: string;
  appId?: string;
  eventBus?: EventBus;
  os?: any; // OS API with notification and fs access
}

export const MessagingClient: React.FC<MessagingClientProps> = ({
  windowId,
  appId = 'messaging-client',
  eventBus,
  os,
}) => {
  const [messagingClient, setMessagingClient] = useState<MessagingClientClass | null>(null);
  const [connectionManager, setConnectionManager] = useState<ConnectionManager | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [storage, setStorage] = useState<MessagingStorage | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Generate client ID
  const generateClientId = useCallback(() => {
    const stored = localStorage.getItem('browser-os-messaging-client-id');
    if (stored) {
      return stored;
    }
    const id = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('browser-os-messaging-client-id', id);
    return id;
  }, []);

  // Initialize client and storage
  useEffect(() => {
    if (!eventBus) {
      setError('EventBus is required');
      return;
    }

    const initClient = async () => {
      try {
        setError(null);
        setConnectionState('connecting');
        
         // Get server URL from environment or use default
         // Check both import.meta.env (Vite) and process.env (Node)
         let serverUrl = 'ws://localhost:8000';
         try {
           // Check Vite's import.meta.env (available in browser/Vite builds)
           const viteEnv = (import.meta as any).env;
           if (viteEnv?.VITE_SERVER_URL) {
             serverUrl = viteEnv.VITE_SERVER_URL;
           }
           // Check Node's process.env (fallback)
           else if (typeof process !== 'undefined' && process.env?.VITE_SERVER_URL) {
             serverUrl = process.env.VITE_SERVER_URL;
           }
         } catch (e) {
           // Ignore errors accessing env - use default
           console.warn('[MessagingClient] Could not read env vars, using default:', e);
         }
        console.log('[MessagingClient] Connecting to server:', serverUrl);
        console.log('[MessagingClient] EventBus available:', !!eventBus);
        
        // Create connection manager
        const connManager = new ConnectionManager({
          serverUrl,
          reconnectInterval: 3000,
          reconnectMaxAttempts: Infinity,
        });

        // Connect to server
        try {
          await connManager.connect();
          console.log('[MessagingClient] Connected to server');
        } catch (connectError) {
          console.error('[MessagingClient] Connection error:', connectError);
          throw new Error(`Failed to connect to server at ${serverUrl}. Make sure the server is running.`);
        }
        
        // Send connect message
        const clientId = generateClientId();
        connManager.send('client:connect', {
          clientId,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        });

        // Create messaging client
        const msgClient = new MessagingClientClass({
          connectionManager: connManager,
          clientId,
        });

        setConnectionManager(connManager);
        setMessagingClient(msgClient);
        setCurrentUserId(clientId);
        setConnectionState('connected');

        // Listen for connection state changes
        const checkConnection = setInterval(() => {
          const state = connManager.getState();
          setConnectionState(state as 'disconnected' | 'connecting' | 'connected' | 'reconnecting');
        }, 1000);

        // Initialize storage if os API is available
        if (os && os.syscall) {
          const fs = {
            read: async (path: string) => {
              const data = await os.syscall('fs.read', { path });
              return typeof data === 'string' ? new TextEncoder().encode(data) : data;
            },
            write: async (path: string, data: Uint8Array) => {
              await os.syscall('fs.write', { path, data });
            },
            exists: async (path: string) => {
              return await os.syscall('fs.exists', { path });
            },
            mkdir: async (path: string, options?: { recursive?: boolean }) => {
              await os.syscall('fs.mkdir', { path, recursive: options?.recursive });
            },
          };
          setStorage(new MessagingStorage(fs));
        }

        return () => {
          clearInterval(checkConnection);
        };
      } catch (error) {
        console.error('[MessagingClient] Failed to initialize client:', error);
        setError(error instanceof Error ? error.message : 'Failed to connect to server');
        setConnectionState('disconnected');
      }
    };

    initClient();

    return () => {
      if (connectionManager) {
        connectionManager.disconnect();
      }
    };
  }, [eventBus, generateClientId, os]);

  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversation,
    sendMessage,
    createConversation,
    loadMessages,
    setTyping,
    typingUsers,
  } = useMessaging({
    messagingClient,
    currentUserId,
  });

  // Get active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const activeMessages = activeConversationId ? messages.get(activeConversationId) || [] : [];
  const activeTypingUsers: Set<string> = activeConversationId ? typingUsers.get(activeConversationId) || new Set<string>() : new Set<string>();

  // Setup notifications
  useNotifications({
    messages,
    conversations,
    currentUserId,
    activeConversationId,
    notificationAPI: os?.notification,
    appId,
    onNotificationClick: (conversationId: string) => {
      setActiveConversation(conversationId);
    },
  });

  // Save conversations to storage when they change
  useEffect(() => {
    if (storage && conversations.length > 0) {
      storage.saveConversations(conversations).catch((error) => {
        console.error('[MessagingClient] Failed to save conversations:', error);
      });
    }
  }, [conversations, storage]);

  // Save messages to storage when they change
  useEffect(() => {
    if (storage && activeConversationId) {
      const conversationMessages = messages.get(activeConversationId) || [];
      if (conversationMessages.length > 0) {
        storage.saveMessages(activeConversationId, conversationMessages).catch((error) => {
          console.error('[MessagingClient] Failed to save messages:', error);
        });
      }
    }
  }, [messages, activeConversationId, storage]);

  // Load conversations from storage on mount
  useEffect(() => {
    if (storage) {
      storage.loadConversations().then((savedConversations) => {
        // Merge with server conversations
        // This is a simple merge - in production you'd want more sophisticated syncing
      });
    }
  }, [storage]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeConversationId) return;
      await sendMessage(activeConversationId, content);
    },
    [activeConversationId, sendMessage]
  );

  const handleCreateConversation = useCallback(async () => {
    // For now, create a conversation with a placeholder participant
    // In a real app, you'd show a dialog to select participants
    const participants = ['other-user']; // Placeholder
    try {
      const conversation = await createConversation(participants);
      setActiveConversation(conversation.id);
      setShowNewConversation(false);
    } catch (error) {
      console.error('[MessagingClient] Failed to create conversation:', error);
    }
  }, [createConversation, setActiveConversation]);

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (activeConversationId) {
        setTyping(activeConversationId, isTyping);
      }
    },
    [activeConversationId, setTyping]
  );

  if (!messagingClient || !connectionManager) {
    return (
      <div className="messaging-client-app loading">
        <div>
          {error ? (
            <>
              <div style={{ color: '#f44336', marginBottom: '8px' }}>Connection Error</div>
              <div style={{ fontSize: '14px', color: '#757575' }}>{error}</div>
              <div style={{ fontSize: '12px', color: '#757575', marginTop: '8px' }}>
                Make sure the server is running on ws://localhost:8000
              </div>
            </>
          ) : (
            <>
              <div>Connecting to server...</div>
              <div style={{ fontSize: '12px', color: '#757575', marginTop: '8px' }}>
                {connectionState === 'connecting' && 'Establishing connection...'}
                {connectionState === 'reconnecting' && 'Reconnecting...'}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="messaging-client-app">
      <div className="messaging-layout">
        <div className="sidebar">
          <div className="sidebar-header">
            <ConnectionStatus state={connectionState} />
          </div>
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            currentUserId={currentUserId}
            onSelectConversation={setActiveConversation}
            onCreateConversation={() => setShowNewConversation(true)}
          />
        </div>
        <div className="main-content">
          {activeConversation ? (
            <>
              <ConversationHeader conversation={activeConversation} currentUserId={currentUserId} />
              <MessageList
                messages={activeMessages}
                currentUserId={currentUserId}
                typingUsers={activeTypingUsers}
              />
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                disabled={connectionState !== 'connected'}
              />
            </>
          ) : (
            <div className="empty-conversation">
              <h2>Select a conversation</h2>
              <p>Choose a conversation from the sidebar or create a new one</p>
            </div>
          )}
        </div>
      </div>
      {showNewConversation && (
        <div className="new-conversation-modal">
          <div className="modal-content">
            <h3>New Conversation</h3>
            <p>Creating conversation with placeholder user...</p>
            <div className="modal-actions">
              <button onClick={handleCreateConversation}>Create</button>
              <button onClick={() => setShowNewConversation(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
