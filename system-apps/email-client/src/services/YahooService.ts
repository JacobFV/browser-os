import type { Email, DraftEmail, Folder, ListOptions, EmailAddress } from '../types';
import type { IEmailService, EmailServiceOptions } from './EmailService';

export class YahooService implements IEmailService {
  private networkAPI: any;
  private tokenManager: any;
  private accountId: string;
  private apiBase = 'https://api.login.yahoo.com';

  constructor(options: EmailServiceOptions) {
    this.networkAPI = options.networkAPI;
    this.tokenManager = options.tokenManager;
    this.accountId = options.accountId;
  }

  /**
   * Get authorization header with valid access token
   */
  private async getAuthHeader(): Promise<string> {
    const accessToken = await this.tokenManager.getValidAccessToken(this.accountId);
    return `Bearer ${accessToken}`;
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest(endpoint: string, options: any = {}): Promise<any> {
    const url = `${this.apiBase}${endpoint}`;
    const authHeader = await this.getAuthHeader();

    const response = await this.networkAPI.request(url, {
      ...options,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
      throw new Error(`Yahoo Mail API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
  }

  /**
   * List messages in a folder
   * Note: Yahoo Mail API structure may vary - this is a basic implementation
   */
  async listMessages(folder: string, options: ListOptions = {}): Promise<Email[]> {
    // Yahoo Mail API endpoint structure
    const folderId = this.mapFolderToId(folder);
    const params = new URLSearchParams();
    
    if (options.maxResults) {
      params.append('limit', options.maxResults.toString());
    }

    const queryString = params.toString();
    // Yahoo Mail API endpoint - adjust based on actual API documentation
    const endpoint = `/ws/v3/mailboxes/inbox/messages${queryString ? `?${queryString}` : ''}`;
    
    try {
      const data = await this.apiRequest(endpoint);
      
      if (!data.messages || data.messages.length === 0) {
        return [];
      }

      return data.messages.map((msg: any) => this.parseYahooMessage(msg, folder));
    } catch (error) {
      console.error('[YahooService] Failed to list messages:', error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Get full message details
   */
  async getMessage(messageId: string): Promise<Email> {
    const data = await this.apiRequest(`/ws/v3/mailboxes/inbox/messages/${messageId}`);
    return this.parseYahooMessage(data, 'inbox');
  }

  /**
   * Parse Yahoo Mail message format to our Email format
   * Note: This is a placeholder - adjust based on actual Yahoo Mail API response structure
   */
  private parseYahooMessage(yahooMessage: any, folder: string): Email {
    return {
      id: yahooMessage.id || yahooMessage.messageId || String(Date.now()),
      accountId: this.accountId,
      folder,
      from: this.parseEmailAddress(yahooMessage.from || yahooMessage.sender),
      to: this.parseEmailAddressList(yahooMessage.to || []),
      cc: yahooMessage.cc ? this.parseEmailAddressList(yahooMessage.cc) : undefined,
      bcc: yahooMessage.bcc ? this.parseEmailAddressList(yahooMessage.bcc) : undefined,
      subject: yahooMessage.subject || '(No subject)',
      body: yahooMessage.body?.text || yahooMessage.textBody || '',
      bodyHtml: yahooMessage.body?.html || yahooMessage.htmlBody,
      preview: yahooMessage.preview || yahooMessage.snippet || '',
      timestamp: yahooMessage.timestamp ? new Date(yahooMessage.timestamp).getTime() : Date.now(),
      read: yahooMessage.isRead !== false,
      starred: yahooMessage.isStarred === true || yahooMessage.isFlagged === true,
      important: yahooMessage.isImportant === true,
    };
  }

  /**
   * Parse email address
   */
  private parseEmailAddress(address: any): EmailAddress {
    if (!address) return { email: '' };
    if (typeof address === 'string') {
      const match = address.match(/^(?:(.*?)\s*<)?(.+?)(?:>)?$/);
      if (match) {
        return {
          name: match[1]?.trim() || undefined,
          email: match[2].trim(),
        };
      }
      return { email: address.trim() };
    }
    return {
      name: address.name || undefined,
      email: address.email || address.address || '',
    };
  }

  /**
   * Parse email address list
   */
  private parseEmailAddressList(addresses: any[]): EmailAddress[] {
    if (!Array.isArray(addresses)) return [];
    return addresses.map(addr => this.parseEmailAddress(addr));
  }

  /**
   * Map folder name to Yahoo Mail folder ID
   */
  private mapFolderToId(folder: string): string {
    const mapping: Record<string, string> = {
      'inbox': 'inbox',
      'sent': 'sent',
      'drafts': 'drafts',
      'trash': 'trash',
      'spam': 'spam',
    };
    return mapping[folder.toLowerCase()] || 'inbox';
  }

  /**
   * Send email
   */
  async sendMessage(message: DraftEmail): Promise<void> {
    const messagePayload = {
      to: message.to,
      cc: message.cc,
      bcc: message.bcc,
      subject: message.subject || '',
      body: message.bodyHtml || message.body || '',
    };

    await this.apiRequest('/ws/v3/mailboxes/outbox/messages', {
      method: 'POST',
      body: JSON.stringify(messagePayload),
    });
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await this.apiRequest(`/ws/v3/mailboxes/inbox/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        isRead: true,
      }),
    });
  }

  /**
   * Mark message as unread
   */
  async markAsUnread(messageId: string): Promise<void> {
    await this.apiRequest(`/ws/v3/mailboxes/inbox/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        isRead: false,
      }),
    });
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await this.apiRequest(`/ws/v3/mailboxes/inbox/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Star message
   */
  async starMessage(messageId: string): Promise<void> {
    await this.apiRequest(`/ws/v3/mailboxes/inbox/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        isStarred: true,
      }),
    });
  }

  /**
   * Unstar message
   */
  async unstarMessage(messageId: string): Promise<void> {
    await this.apiRequest(`/ws/v3/mailboxes/inbox/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        isStarred: false,
      }),
    });
  }

  /**
   * Get folders (mailboxes)
   */
  async getFolders(): Promise<Folder[]> {
    try {
      const data = await this.apiRequest('/ws/v3/mailboxes');
      
      const folders: Folder[] = [];
      const typeMap: Record<string, Folder['type']> = {
        'Inbox': 'inbox',
        'Sent': 'sent',
        'Drafts': 'drafts',
        'Trash': 'trash',
        'Spam': 'spam',
      };

      for (const folder of data.mailboxes || []) {
        const type = typeMap[folder.name] || 'custom';
        folders.push({
          id: folder.id || folder.name,
          name: folder.name,
          unreadCount: folder.unreadCount || 0,
          type,
        });
      }

      return folders;
    } catch (error) {
      console.error('[YahooService] Failed to get folders:', error);
      // Return default folders
      return [
        { id: 'inbox', name: 'Inbox', unreadCount: 0, type: 'inbox' },
        { id: 'sent', name: 'Sent', unreadCount: 0, type: 'sent' },
        { id: 'drafts', name: 'Drafts', unreadCount: 0, type: 'drafts' },
        { id: 'trash', name: 'Trash', unreadCount: 0, type: 'trash' },
        { id: 'spam', name: 'Spam', unreadCount: 0, type: 'spam' },
      ];
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<{ email: string; name?: string }> {
    try {
      const data = await this.apiRequest('/ws/v3/user');
      return {
        email: data.email || '',
        name: data.name || undefined,
      };
    } catch (error) {
      console.error('[YahooService] Failed to get profile:', error);
      return { email: '' };
    }
  }
}

