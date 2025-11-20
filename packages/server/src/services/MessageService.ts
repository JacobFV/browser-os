import type { Message, Conversation, Attachment } from '../types';

/**
 * Service for managing messages and conversations
 */
export class MessageService {
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message[]> = new Map(); // conversationId -> messages
  private presence: Map<string, 'online' | 'offline'> = new Map();
  private typing: Map<string, Set<string>> = new Map(); // conversationId -> Set of userIds typing

  /**
   * Send a message and route it to recipients
   */
  async sendMessage(message: Message): Promise<Message> {
    // Store message
    const conversationMessages = this.messages.get(message.conversationId) || [];
    conversationMessages.push(message);
    this.messages.set(message.conversationId, conversationMessages);

    // Update conversation
    const conversation = this.conversations.get(message.conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.lastActivity = message.timestamp;
      
      // Increment unread counts for all participants except sender
      conversation.participants.forEach((participantId) => {
        if (participantId !== message.senderId) {
          conversation.unreadCounts[participantId] = (conversation.unreadCounts[participantId] || 0) + 1;
        }
      });
    }

    return message;
  }

  /**
   * Create a new conversation
   */
  createConversation(participants: string[]): Conversation {
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation: Conversation = {
      id: conversationId,
      participants,
      lastActivity: Date.now(),
      unreadCounts: {},
    };

    // Initialize unread counts
    participants.forEach((participantId) => {
      conversation.unreadCounts[participantId] = 0;
    });

    this.conversations.set(conversationId, conversation);
    this.messages.set(conversationId, []);

    return conversation;
  }

  /**
   * Get conversations for a user
   */
  getConversations(userId: string): Conversation[] {
    const userConversations: Conversation[] = [];
    
    this.conversations.forEach((conversation) => {
      if (conversation.participants.includes(userId)) {
        userConversations.push(conversation);
      }
    });

    // Sort by last activity (most recent first)
    return userConversations.sort((a, b) => b.lastActivity - a.lastActivity);
  }

  /**
   * Get messages for a conversation
   */
  getMessages(conversationId: string, limit?: number): Message[] {
    const conversationMessages = this.messages.get(conversationId) || [];
    
    if (limit) {
      // Return most recent messages
      return conversationMessages.slice(-limit);
    }
    
    return conversationMessages;
  }

  /**
   * Get a conversation by ID
   */
  getConversation(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * Update user presence
   */
  updatePresence(userId: string, status: 'online' | 'offline'): void {
    this.presence.set(userId, status);
  }

  /**
   * Get user presence
   */
  getPresence(userId: string): 'online' | 'offline' {
    return this.presence.get(userId) || 'offline';
  }

  /**
   * Set typing indicator
   */
  setTyping(conversationId: string, userId: string, isTyping: boolean): void {
    if (!this.typing.has(conversationId)) {
      this.typing.set(conversationId, new Set());
    }

    const typingUsers = this.typing.get(conversationId)!;
    
    if (isTyping) {
      typingUsers.add(userId);
    } else {
      typingUsers.delete(userId);
    }
  }

  /**
   * Get typing users for a conversation
   */
  getTypingUsers(conversationId: string): string[] {
    const typingUsers = this.typing.get(conversationId);
    return typingUsers ? Array.from(typingUsers) : [];
  }

  /**
   * Mark conversation as read for a user
   */
  markAsRead(conversationId: string, userId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.unreadCounts[userId] = 0;
    }
  }

  /**
   * Get unread count for a user in a conversation
   */
  getUnreadCount(conversationId: string, userId: string): number {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return 0;
    }
    return conversation.unreadCounts[userId] || 0;
  }
}

