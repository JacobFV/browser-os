import type { Email, DraftEmail, Folder, ListOptions, EmailAddress } from '../types';
import type { IEmailService, EmailServiceOptions } from './EmailService';

export class OutlookService implements IEmailService {
  private networkAPI: any;
  private tokenManager: any;
  private accountId: string;
  private apiBase = 'https://graph.microsoft.com/v1.0';

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
      throw new Error(`Microsoft Graph API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
  }

  /**
   * List messages in a folder
   */
  async listMessages(folder: string, options: ListOptions = {}): Promise<Email[]> {
    const folderId = this.mapFolderToId(folder);
    const params = new URLSearchParams();
    
    if (options.maxResults) {
      params.append('$top', options.maxResults.toString());
    }
    if (options.q) {
      params.append('$filter', `contains(subject,'${options.q}') or contains(bodyPreview,'${options.q}')`);
    }
    
    // Order by receivedDateTime descending
    params.append('$orderby', 'receivedDateTime desc');

    const queryString = params.toString();
    const endpoint = `/me/mailFolders/${folderId}/messages${queryString ? `?${queryString}` : ''}`;
    
    const data = await this.apiRequest(endpoint);
    
    if (!data.value || data.value.length === 0) {
      return [];
    }

    return data.value.map((msg: any) => this.parseOutlookMessage(msg, folder));
  }

  /**
   * Get full message details
   */
  async getMessage(messageId: string): Promise<Email> {
    const data = await this.apiRequest(`/me/messages/${messageId}`);
    return this.parseOutlookMessage(data, this.getFolderFromMessage(data));
  }

  /**
   * Parse Microsoft Graph message format to our Email format
   */
  private parseOutlookMessage(outlookMessage: any, folder: string): Email {
    return {
      id: outlookMessage.id,
      accountId: this.accountId,
      folder,
      from: this.parseEmailAddress(outlookMessage.from),
      to: this.parseEmailAddressList(outlookMessage.toRecipients || []),
      cc: outlookMessage.ccRecipients ? this.parseEmailAddressList(outlookMessage.ccRecipients) : undefined,
      bcc: outlookMessage.bccRecipients ? this.parseEmailAddressList(outlookMessage.bccRecipients) : undefined,
      subject: outlookMessage.subject || '(No subject)',
      body: outlookMessage.body?.content || '',
      bodyHtml: outlookMessage.body?.contentType === 'html' ? outlookMessage.body.content : undefined,
      preview: outlookMessage.bodyPreview || '',
      timestamp: new Date(outlookMessage.receivedDateTime).getTime(),
      read: outlookMessage.isRead || false,
      starred: outlookMessage.flag?.flagStatus === 'flagged' || false,
      important: outlookMessage.importance === 'high' || false,
      attachments: outlookMessage.hasAttachments ? [] : undefined, // Will be loaded separately if needed
    };
  }

  /**
   * Parse email address object to EmailAddress
   */
  private parseEmailAddress(address: any): EmailAddress {
    if (!address) return { email: '' };
    return {
      name: address.name || undefined,
      email: address.emailAddress || '',
    };
  }

  /**
   * Parse email address list
   */
  private parseEmailAddressList(addresses: any[]): EmailAddress[] {
    return addresses.map(addr => this.parseEmailAddress(addr));
  }

  /**
   * Map folder name to Microsoft Graph folder ID
   */
  private mapFolderToId(folder: string): string {
    const mapping: Record<string, string> = {
      'inbox': 'Inbox',
      'sent': 'SentItems',
      'drafts': 'Drafts',
      'trash': 'DeletedItems',
      'spam': 'JunkEmail',
    };
    return mapping[folder.toLowerCase()] || 'Inbox';
  }

  /**
   * Get folder name from message
   */
  private getFolderFromMessage(message: any): string {
    // Microsoft Graph includes parentFolderId, but we'll use a default for now
    return 'inbox';
  }

  /**
   * Send email
   */
  async sendMessage(message: DraftEmail): Promise<void> {
    const messagePayload = {
      message: {
        subject: message.subject || '',
        body: {
          contentType: message.bodyHtml ? 'HTML' : 'Text',
          content: message.bodyHtml || message.body || '',
        },
        toRecipients: message.to.map(email => ({ emailAddress: { address: email } })),
        ccRecipients: message.cc?.map(email => ({ emailAddress: { address: email } })),
        bccRecipients: message.bcc?.map(email => ({ emailAddress: { address: email } })),
      },
    };

    await this.apiRequest('/me/sendMail', {
      method: 'POST',
      body: JSON.stringify(messagePayload),
    });
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await this.apiRequest(`/me/messages/${messageId}`, {
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
    await this.apiRequest(`/me/messages/${messageId}`, {
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
    await this.apiRequest(`/me/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Star message (flag)
   */
  async starMessage(messageId: string): Promise<void> {
    await this.apiRequest(`/me/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        flag: {
          flagStatus: 'flagged',
        },
      }),
    });
  }

  /**
   * Unstar message (unflag)
   */
  async unstarMessage(messageId: string): Promise<void> {
    await this.apiRequest(`/me/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        flag: {
          flagStatus: 'notFlagged',
        },
      }),
    });
  }

  /**
   * Get folders (mail folders)
   */
  async getFolders(): Promise<Folder[]> {
    const data = await this.apiRequest('/me/mailFolders');
    
    const folders: Folder[] = [];
    const typeMap: Record<string, Folder['type']> = {
      'Inbox': 'inbox',
      'SentItems': 'sent',
      'Drafts': 'drafts',
      'DeletedItems': 'trash',
      'JunkEmail': 'spam',
    };

    for (const folder of data.value || []) {
      const type = typeMap[folder.displayName] || 'custom';
      folders.push({
        id: folder.id,
        name: folder.displayName,
        unreadCount: folder.unreadItemCount || 0,
        type,
      });
    }

    return folders;
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<{ email: string; name?: string }> {
    const data = await this.apiRequest('/me');
    return {
      email: data.mail || data.userPrincipalName || '',
      name: data.displayName || undefined,
    };
  }
}

