import { useState, useEffect, useCallback, useRef } from 'react';
import type { Message, Conversation } from '../types';

// Import MessagingClient type from the client package
type MessagingClient = import('@browser-os/client').MessagingClient;

export interface UseMessagingOptions {
  messagingClient: MessagingClient | null;
  currentUserId: string;
}

export interface UseMessagingReturn {
  conversations: Conversation[];
  messages: Map<string, Message[]>;
  activeConversationId: string | null;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  setActiveConversation: (conversationId: string | null) => void;
  sendMessage: (conversationId: string, content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  createConversation: (participants: string[]) => Promise<Conversation>;
  loadMessages: (conversationId: string) => Promise<void>;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  typingUsers: Map<string, Set<string>>; // conversationId -> Set of userIds
}

export function useMessaging(options: UseMessagingOptions): UseMessagingReturn {
  const { messagingClient, currentUserId } = options;
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());

  const conversationsRef = useRef<Conversation[]>([]);
  const messagesRef = useRef<Map<string, Message[]>>(new Map());

  // Update refs when state changes
  useEffect(() => {
    conversationsRef.current = conversations;
    messagesRef.current = messages;
  }, [conversations, messages]);

  // Load conversations on mount
  useEffect(() => {
    if (!messagingClient) return;

    const loadConversations = async () => {
      try {
        const convs = await messagingClient.getConversations();
        setConversations(convs);
        conversationsRef.current = convs;
      } catch (error) {
        console.error('[useMessaging] Failed to load conversations:', error);
      }
    };

    loadConversations();

    // Set up message handler
    const unsubscribeMessage = messagingClient.onMessage((message: Message) => {
      const currentMessages = messagesRef.current.get(message.conversationId) || [];
      const updatedMessages = new Map(messagesRef.current);
      updatedMessages.set(message.conversationId, [...currentMessages, message]);
      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;

      // Update conversation
      const updatedConversations = conversationsRef.current.map((conv) => {
        if (conv.id === message.conversationId) {
          return {
            ...conv,
            lastMessage: message,
            lastActivity: message.timestamp,
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
      conversationsRef.current = updatedConversations;
    });

    // Set up conversation update handler
    const unsubscribeConversation = messagingClient.onConversationUpdate((conversation: Conversation) => {
      const existingIndex = conversationsRef.current.findIndex((c) => c.id === conversation.id);
      let updatedConversations: Conversation[];
      
      if (existingIndex >= 0) {
        updatedConversations = [...conversationsRef.current];
        updatedConversations[existingIndex] = conversation;
      } else {
        updatedConversations = [...conversationsRef.current, conversation];
      }

      // Sort by last activity
      updatedConversations.sort((a, b) => b.lastActivity - a.lastActivity);
      setConversations(updatedConversations);
      conversationsRef.current = updatedConversations;
    });

    return () => {
      unsubscribeMessage();
      unsubscribeConversation();
    };
  }, [messagingClient]);

  // Listen for typing indicators
  useEffect(() => {
    if (!messagingClient) return;

    const unsubscribe = messagingClient.onTyping((data) => {
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        const users = updated.get(data.conversationId) || new Set();
        
        if (data.isTyping) {
          users.add(data.userId);
        } else {
          users.delete(data.userId);
        }
        
        updated.set(data.conversationId, users);
        return updated;
      });
    });

    return unsubscribe;
  }, [messagingClient]);

  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'file' = 'text'
  ) => {
    if (!messagingClient || !content.trim()) return;

    try {
      await messagingClient.sendMessage(conversationId, content, type);
    } catch (error) {
      console.error('[useMessaging] Failed to send message:', error);
      throw error;
    }
  }, [messagingClient]);

  const createConversation = useCallback(async (participants: string[]): Promise<Conversation> => {
    if (!messagingClient) {
      throw new Error('Messaging client not available');
    }

    try {
      const conversation = await messagingClient.createConversation(participants);
      return conversation;
    } catch (error) {
      console.error('[useMessaging] Failed to create conversation:', error);
      throw error;
    }
  }, [messagingClient]);

  const loadMessages = useCallback(async (conversationId: string) => {
    if (!messagingClient) return;

    try {
      const loadedMessages = await messagingClient.getMessages(conversationId, 100);
      const updatedMessages = new Map(messagesRef.current);
      updatedMessages.set(conversationId, loadedMessages);
      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;
    } catch (error) {
      console.error('[useMessaging] Failed to load messages:', error);
    }
  }, [messagingClient]);

  const setTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (!messagingClient) return;
    messagingClient.setTyping(conversationId, isTyping);
  }, [messagingClient]);

  const setActiveConversation = useCallback((conversationId: string | null) => {
    setActiveConversationId(conversationId);
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [loadMessages]);

  return {
    conversations,
    messages,
    activeConversationId,
    connectionState,
    setActiveConversation,
    sendMessage,
    createConversation,
    loadMessages,
    setTyping,
    typingUsers,
  };
}

