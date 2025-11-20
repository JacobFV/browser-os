export type EmailProvider = 'gmail' | 'outlook' | 'yahoo';

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
}

export interface EmailAccount {
  id: string;
  email: string;
  provider: EmailProvider;
  tokens: OAuthTokens;
  lastSyncTimestamp?: number;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  error?: string;
}

export interface Email {
  id: string;
  threadId?: string;
  accountId: string;
  folder: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  bodyHtml?: string;
  preview?: string;
  timestamp: number;
  read: boolean;
  starred: boolean;
  important?: boolean;
  attachments?: Attachment[];
  headers?: Record<string, string>;
}

export interface EmailAddress {
  name?: string;
  email: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  data?: Uint8Array;
  url?: string;
}

export interface DraftEmail {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyHtml?: string;
  attachments?: Attachment[];
}

export interface Folder {
  id: string;
  name: string;
  unreadCount: number;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'custom';
}

export interface ListOptions {
  maxResults?: number;
  pageToken?: string;
  since?: number;
  q?: string; // Search query
}

export interface AccountMetadata {
  accountId: string;
  lastSyncTimestamp: number;
  folders: Folder[];
  historyId?: string; // Gmail-specific
  deltaToken?: string; // Outlook-specific
}

export interface OAuthConfig {
  clientId: string;
  clientSecret?: string; // Only needed for server-side token exchange
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}

