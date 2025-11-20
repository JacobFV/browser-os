import type { Email, DraftEmail, Folder, ListOptions } from '../types';

export interface EmailServiceOptions {
  networkAPI: any; // os.network API
  tokenManager: any; // TokenManager instance
  accountId: string;
}

/**
 * Base email service interface
 */
export interface IEmailService {
  listMessages(folder: string, options?: ListOptions): Promise<Email[]>;
  getMessage(messageId: string): Promise<Email>;
  sendMessage(message: DraftEmail): Promise<void>;
  markAsRead(messageId: string): Promise<void>;
  markAsUnread(messageId: string): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  starMessage(messageId: string): Promise<void>;
  unstarMessage(messageId: string): Promise<void>;
  getFolders(): Promise<Folder[]>;
  getProfile(): Promise<{ email: string; name?: string }>;
}

