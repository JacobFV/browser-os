export interface Attachment {
  id: string;
  type: string;
  url: string;
  name: string;
  size: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'file';
  attachments?: Attachment[];
  replyTo?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastActivity: number;
  unreadCounts: Record<string, number>;
  metadata?: Record<string, unknown>;
}

