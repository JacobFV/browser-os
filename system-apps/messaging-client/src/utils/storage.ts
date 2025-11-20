import type { Message, Conversation } from '../types';

const CONVERSATIONS_PATH = '/home/user/.messaging/conversations.json';
const QUEUE_PATH = '/home/user/.messaging/queue.json';
const PREFERENCES_PATH = '/home/user/.messaging/preferences.json';

/**
 * Get messages file path for a conversation
 */
function getMessagesPath(conversationId: string): string {
  return `/home/user/.messaging/conversations/${conversationId}/messages.json`;
}

/**
 * Storage utilities for messaging app
 */
export class MessagingStorage {
  constructor(private fs: any) {}

  /**
   * Save conversations metadata
   */
  async saveConversations(conversations: Conversation[]): Promise<void> {
    try {
      await this.fs.write(CONVERSATIONS_PATH, JSON.stringify(conversations, null, 2));
    } catch (error) {
      console.error('[MessagingStorage] Failed to save conversations:', error);
    }
  }

  /**
   * Load conversations metadata
   */
  async loadConversations(): Promise<Conversation[]> {
    try {
      const exists = await this.fs.exists(CONVERSATIONS_PATH);
      if (!exists) {
        return [];
      }
      const data = await this.fs.read(CONVERSATIONS_PATH);
      return JSON.parse(data);
    } catch (error) {
      console.error('[MessagingStorage] Failed to load conversations:', error);
      return [];
    }
  }

  /**
   * Save messages for a conversation
   */
  async saveMessages(conversationId: string, messages: Message[]): Promise<void> {
    try {
      const messagesPath = getMessagesPath(conversationId);
      const dirPath = `/home/user/.messaging/conversations/${conversationId}`;
      
      // Ensure directory exists
      const dirExists = await this.fs.exists(dirPath);
      if (!dirExists) {
        await this.fs.mkdir(dirPath, { recursive: true });
      }

      await this.fs.write(messagesPath, JSON.stringify(messages, null, 2));
    } catch (error) {
      console.error('[MessagingStorage] Failed to save messages:', error);
    }
  }

  /**
   * Load messages for a conversation
   */
  async loadMessages(conversationId: string): Promise<Message[]> {
    try {
      const messagesPath = getMessagesPath(conversationId);
      const exists = await this.fs.exists(messagesPath);
      if (!exists) {
        return [];
      }
      const data = await this.fs.read(messagesPath);
      return JSON.parse(data);
    } catch (error) {
      console.error('[MessagingStorage] Failed to load messages:', error);
      return [];
    }
  }

  /**
   * Save offline message queue
   */
  async saveQueue(messages: Message[]): Promise<void> {
    try {
      await this.fs.write(QUEUE_PATH, JSON.stringify(messages, null, 2));
    } catch (error) {
      console.error('[MessagingStorage] Failed to save queue:', error);
    }
  }

  /**
   * Load offline message queue
   */
  async loadQueue(): Promise<Message[]> {
    try {
      const exists = await this.fs.exists(QUEUE_PATH);
      if (!exists) {
        return [];
      }
      const data = await this.fs.read(QUEUE_PATH);
      return JSON.parse(data);
    } catch (error) {
      console.error('[MessagingStorage] Failed to load queue:', error);
      return [];
    }
  }

  /**
   * Save user preferences
   */
  async savePreferences(preferences: Record<string, unknown>): Promise<void> {
    try {
      await this.fs.write(PREFERENCES_PATH, JSON.stringify(preferences, null, 2));
    } catch (error) {
      console.error('[MessagingStorage] Failed to save preferences:', error);
    }
  }

  /**
   * Load user preferences
   */
  async loadPreferences(): Promise<Record<string, unknown>> {
    try {
      const exists = await this.fs.exists(PREFERENCES_PATH);
      if (!exists) {
        return {};
      }
      const data = await this.fs.read(PREFERENCES_PATH);
      return JSON.parse(data);
    } catch (error) {
      console.error('[MessagingStorage] Failed to load preferences:', error);
      return {};
    }
  }
}

