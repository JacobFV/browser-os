import type { Email, DraftEmail, Folder, ListOptions, EmailAddress } from '../types';
import type { IEmailService, EmailServiceOptions } from './EmailService';

export class GmailService implements IEmailService {
  private networkAPI: any;
  private tokenManager: any;
  private accountId: string;
  private apiBase = 'https://gmail.googleapis.com/gmail/v1';

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
      throw new Error(`Gmail API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
  }

  /**
   * List messages in a folder
   */
  async listMessages(folder: string, options: ListOptions = {}): Promise<Email[]> {
    const params = new URLSearchParams();
    
    if (options.maxResults) {
      params.append('maxResults', options.maxResults.toString());
    }
    if (options.pageToken) {
      params.append('pageToken', options.pageToken);
    }
    if (options.q) {
      params.append('q', options.q);
    }

    // Map folder names to Gmail labels
    const labelId = this.mapFolderToLabel(folder);
    if (labelId) {
      params.append('labelIds', labelId);
    }

    const queryString = params.toString();
    const endpoint = `/users/me/messages${queryString ? `?${queryString}` : ''}`;
    
    const data = await this.apiRequest(endpoint);
    
    if (!data.messages || data.messages.length === 0) {
      return [];
    }

    // Fetch full message details for each message ID
    const messagePromises = data.messages.slice(0, options.maxResults || 50).map((msg: any) =>
      this.getMessage(msg.id)
    );

    return Promise.all(messagePromises);
  }

  /**
   * Get full message details
   */
  async getMessage(messageId: string): Promise<Email> {
    const data = await this.apiRequest(`/users/me/messages/${messageId}?format=full`);

    return this.parseGmailMessage(data);
  }

  /**
   * Parse Gmail API message format to our Email format
   */
  private parseGmailMessage(gmailMessage: any): Email {
    const headers = this.parseHeaders(gmailMessage.payload?.headers || []);
    const body = this.extractBody(gmailMessage.payload);
    
    return {
      id: gmailMessage.id,
      threadId: gmailMessage.threadId,
      accountId: this.accountId,
      folder: this.getPrimaryLabel(gmailMessage.labelIds || []),
      from: this.parseEmailAddress(headers.from || ''),
      to: this.parseEmailAddressList(headers.to || ''),
      cc: headers.cc ? this.parseEmailAddressList(headers.cc) : undefined,
      bcc: headers.bcc ? this.parseEmailAddressList(headers.bcc) : undefined,
      subject: headers.subject || '(No subject)',
      body: body.text || '',
      bodyHtml: body.html,
      preview: body.text?.substring(0, 200) || '',
      timestamp: parseInt(gmailMessage.internalDate) || Date.now(),
      read: !gmailMessage.labelIds?.includes('UNREAD'),
      starred: gmailMessage.labelIds?.includes('STARRED') || false,
      important: gmailMessage.labelIds?.includes('IMPORTANT') || false,
      headers: headers,
    };
  }

  /**
   * Extract body text and HTML from Gmail message payload
   */
  private extractBody(payload: any): { text?: string; html?: string } {
    if (!payload) return {};

    let text: string | undefined;
    let html: string | undefined;

    if (payload.body?.data) {
      text = this.decodeBase64(payload.body.data);
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          text = this.decodeBase64(part.body.data);
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          html = this.decodeBase64(part.body.data);
        } else if (part.parts) {
          // Recursive for multipart messages
          const nested = this.extractBody(part);
          if (nested.text) text = nested.text;
          if (nested.html) html = nested.html;
        }
      }
    }

    return { text, html };
  }

  /**
   * Parse headers array into object
   */
  private parseHeaders(headers: Array<{ name: string; value: string }>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const header of headers) {
      result[header.name.toLowerCase()] = header.value;
    }
    return result;
  }

  /**
   * Parse email address string to EmailAddress object
   */
  private parseEmailAddress(addressStr: string): EmailAddress {
    const match = addressStr.match(/^(?:(.*?)\s*<)?(.+?)(?:>)?$/);
    if (match) {
      return {
        name: match[1]?.trim() || undefined,
        email: match[2].trim(),
      };
    }
    return { email: addressStr.trim() };
  }

  /**
   * Parse comma-separated email address list
   */
  private parseEmailAddressList(addressListStr: string): EmailAddress[] {
    return addressListStr.split(',').map(addr => this.parseEmailAddress(addr.trim()));
  }

  /**
   * Decode base64url encoded string
   */
  private decodeBase64(base64url: string): string {
    // Gmail uses base64url encoding
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    try {
      return decodeURIComponent(
        atob(base64 + padding)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (error) {
      console.error('[GmailService] Failed to decode base64:', error);
      return '';
    }
  }

  /**
   * Map folder name to Gmail label ID
   */
  private mapFolderToLabel(folder: string): string | null {
    const mapping: Record<string, string> = {
      'inbox': 'INBOX',
      'sent': 'SENT',
      'drafts': 'DRAFT',
      'trash': 'TRASH',
      'spam': 'SPAM',
    };
    return mapping[folder.toLowerCase()] || null;
  }

  /**
   * Get primary label from label IDs
   */
  private getPrimaryLabel(labelIds: string[]): string {
    // Exclude system labels
    const systemLabels = ['UNREAD', 'STARRED', 'IMPORTANT', 'CATEGORY_PERSONAL', 'CATEGORY_SOCIAL', 'CATEGORY_PROMOTIONS', 'CATEGORY_UPDATES', 'CATEGORY_FORUMS'];
    const userLabels = labelIds.filter(id => !systemLabels.includes(id));
    
    // Map Gmail labels to folder names
    const labelMap: Record<string, string> = {
      'INBOX': 'inbox',
      'SENT': 'sent',
      'DRAFT': 'drafts',
      'TRASH': 'trash',
      'SPAM': 'spam',
    };

    for (const labelId of userLabels) {
      if (labelMap[labelId]) {
        return labelMap[labelId];
      }
    }

    return userLabels[0] || 'inbox';
  }

  /**
   * Send email
   */
  async sendMessage(message: DraftEmail): Promise<void> {
    // Build RFC 2822 email message
    const emailMessage = this.buildEmailMessage(message);
    
    // Encode message as base64url
    const encodedMessage = btoa(emailMessage)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await this.apiRequest('/users/me/messages/send', {
      method: 'POST',
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });
  }

  /**
   * Build RFC 2822 email message string
   */
  private buildEmailMessage(message: DraftEmail): string {
    const lines: string[] = [];
    
    lines.push(`To: ${message.to.join(', ')}`);
    if (message.cc && message.cc.length > 0) {
      lines.push(`Cc: ${message.cc.join(', ')}`);
    }
    if (message.bcc && message.bcc.length > 0) {
      lines.push(`Bcc: ${message.bcc.join(', ')}`);
    }
    lines.push(`Subject: ${message.subject || ''}`);
    lines.push('Content-Type: text/html; charset=utf-8');
    lines.push('');
    lines.push(message.bodyHtml || message.body || '');

    return lines.join('\r\n');
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await this.apiRequest(`/users/me/messages/${messageId}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        removeLabelIds: ['UNREAD'],
      }),
    });
  }

  /**
   * Mark message as unread
   */
  async markAsUnread(messageId: string): Promise<void> {
    await this.apiRequest(`/users/me/messages/${messageId}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        addLabelIds: ['UNREAD'],
      }),
    });
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await this.apiRequest(`/users/me/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Star message
   */
  async starMessage(messageId: string): Promise<void> {
    await this.apiRequest(`/users/me/messages/${messageId}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        addLabelIds: ['STARRED'],
      }),
    });
  }

  /**
   * Unstar message
   */
  async unstarMessage(messageId: string): Promise<void> {
    await this.apiRequest(`/users/me/messages/${messageId}/modify`, {
      method: 'POST',
      body: JSON.stringify({
        removeLabelIds: ['STARRED'],
      }),
    });
  }

  /**
   * Get folders (labels)
   */
  async getFolders(): Promise<Folder[]> {
    const data = await this.apiRequest('/users/me/labels');
    
    const folders: Folder[] = [];
    const labelMap: Record<string, Folder['type']> = {
      'INBOX': 'inbox',
      'SENT': 'sent',
      'DRAFT': 'drafts',
      'TRASH': 'trash',
      'SPAM': 'spam',
    };

    for (const label of data.labels || []) {
      const type = labelMap[label.id] || 'custom';
      folders.push({
        id: label.id,
        name: label.name,
        unreadCount: label.messagesUnread || 0,
        type,
      });
    }

    return folders;
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<{ email: string; name?: string }> {
    const data = await this.apiRequest('/users/me/profile');
    return {
      email: data.emailAddress || '',
      name: data.messagesTotal ? undefined : undefined, // Gmail API doesn't return name
    };
  }
}

