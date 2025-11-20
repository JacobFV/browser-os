import type { EmailAccount, OAuthTokens, EmailProvider } from '../types';
import { OAuthManager } from './OAuthManager';

export interface TokenManagerOptions {
  fsAPI: any; // os.fs API
  oauthManager: OAuthManager;
  basePath?: string;
}

export class TokenManager {
  private fsAPI: any;
  private oauthManager: OAuthManager;
  private basePath: string;
  private accounts: Map<string, EmailAccount> = new Map();

  constructor(options: TokenManagerOptions) {
    this.fsAPI = options.fsAPI;
    this.oauthManager = options.oauthManager;
    this.basePath = options.basePath || '/home/user/.email-client';
  }

  /**
   * Initialize token manager - load accounts from storage
   */
  async initialize(): Promise<void> {
    try {
      // Ensure base directory exists
      await this.ensureDirectory(this.basePath);
      await this.ensureDirectory(`${this.basePath}/tokens`);

      // Load all account tokens
      const tokenFiles = await this.listTokenFiles();
      for (const file of tokenFiles) {
        try {
          const account = await this.loadAccount(file);
          if (account) {
            this.accounts.set(account.id, account);
          }
        } catch (error) {
          console.error(`[TokenManager] Failed to load account from ${file}:`, error);
        }
      }
    } catch (error) {
      console.error('[TokenManager] Initialization error:', error);
      // Continue anyway - might be first run
    }
  }

  /**
   * Save account tokens
   */
  async saveAccount(account: EmailAccount): Promise<void> {
    this.accounts.set(account.id, account);
    
    const tokenPath = `${this.basePath}/tokens/${account.id}.json`;
    const encryptedData = this.encryptTokens(account.tokens);
    
    const accountData = {
      id: account.id,
      email: account.email,
      provider: account.provider,
      tokens: encryptedData,
      lastSyncTimestamp: account.lastSyncTimestamp,
    };

    const jsonString = JSON.stringify(accountData, null, 2);
    const data = typeof jsonString === 'string' ? jsonString : new TextEncoder().encode(jsonString);
    await this.fsAPI.write(tokenPath, data);
  }

  /**
   * Load account from storage
   */
  private async loadAccount(file: string): Promise<EmailAccount | null> {
    const data = await this.fsAPI.read(file);
    const text = typeof data === 'string' ? data : new TextDecoder().decode(new Uint8Array(data));
    const accountData = JSON.parse(text);

    const tokens = this.decryptTokens(accountData.tokens);

    return {
      id: accountData.id,
      email: accountData.email,
      provider: accountData.provider,
      tokens,
      lastSyncTimestamp: accountData.lastSyncTimestamp,
      status: 'connected',
    };
  }

  /**
   * Get account by ID
   */
  getAccount(accountId: string): EmailAccount | undefined {
    return this.accounts.get(accountId);
  }

  /**
   * Get all accounts
   */
  getAllAccounts(): EmailAccount[] {
    return Array.from(this.accounts.values());
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  async getValidAccessToken(accountId: string): Promise<string> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const expiresAt = account.tokens.expiresAt;
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes

    if (now >= expiresAt - bufferTime) {
      // Token expired or about to expire, refresh it
      try {
        const newTokens = await this.oauthManager.refreshToken(
          account.provider,
          account.tokens.refreshToken
        );
        
        account.tokens = newTokens;
        await this.saveAccount(account);
        
        return newTokens.accessToken;
      } catch (error) {
        console.error(`[TokenManager] Failed to refresh token for ${accountId}:`, error);
        account.status = 'error';
        account.error = error instanceof Error ? error.message : 'Token refresh failed';
        throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return account.tokens.accessToken;
  }

  /**
   * Remove account and revoke tokens
   */
  async removeAccount(accountId: string): Promise<void> {
    const account = this.accounts.get(accountId);
    if (account) {
      try {
        // Revoke tokens
        await this.oauthManager.revokeToken(account.provider, account.tokens.accessToken);
      } catch (error) {
        console.warn(`[TokenManager] Failed to revoke tokens for ${accountId}:`, error);
      }

      // Remove from memory
      this.accounts.delete(accountId);

      // Delete token file
      const tokenPath = `${this.basePath}/tokens/${accountId}.json`;
      try {
        await this.fsAPI.delete(tokenPath);
      } catch (error) {
        console.warn(`[TokenManager] Failed to delete token file:`, error);
      }
    }
  }

  /**
   * Update account status
   */
  async updateAccountStatus(accountId: string, status: EmailAccount['status'], error?: string): Promise<void> {
    const account = this.accounts.get(accountId);
    if (account) {
      account.status = status;
      account.error = error;
      // Don't save status changes to disk (they're transient)
    }
  }

  /**
   * Update last sync timestamp
   */
  async updateLastSync(accountId: string, timestamp: number): Promise<void> {
    const account = this.accounts.get(accountId);
    if (account) {
      account.lastSyncTimestamp = timestamp;
      await this.saveAccount(account);
    }
  }

  /**
   * Simple encryption/decryption (XOR with key)
   * In production, use proper encryption like Web Crypto API
   */
  private encryptTokens(tokens: OAuthTokens): string {
    // Simple base64 encoding for now
    // In production, use Web Crypto API for proper encryption
    const json = JSON.stringify(tokens);
    return btoa(json);
  }

  private decryptTokens(encrypted: string): OAuthTokens {
    try {
      const json = atob(encrypted);
      return JSON.parse(json);
    } catch (error) {
      throw new Error('Failed to decrypt tokens');
    }
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectory(path: string): Promise<void> {
    try {
      await this.fsAPI.mkdir(path, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }
  }

  /**
   * List all token files
   */
  private async listTokenFiles(): Promise<string[]> {
    try {
      const exists = await this.fsAPI.exists(`${this.basePath}/tokens`);
      if (!exists) {
        return [];
      }
      const files = await this.fsAPI.readdir(`${this.basePath}/tokens`);
      return files
        .filter((file: string) => file.endsWith('.json'))
        .map((file: string) => `${this.basePath}/tokens/${file}`);
    } catch (error) {
      return [];
    }
  }
}

