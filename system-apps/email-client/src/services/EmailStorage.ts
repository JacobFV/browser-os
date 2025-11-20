import type { Email, AccountMetadata, Folder } from '../types';

export interface EmailStorageOptions {
  fsAPI: any; // os.fs API
  basePath?: string;
}

export class EmailStorage {
  private fsAPI: any;
  private basePath: string;

  constructor(options: EmailStorageOptions) {
    this.fsAPI = options.fsAPI;
    this.basePath = options.basePath || '/home/user/.email-client';
  }

  /**
   * Initialize storage directories
   */
  async initialize(): Promise<void> {
    await this.ensureDirectory(this.basePath);
    await this.ensureDirectory(`${this.basePath}/emails`);
    await this.ensureDirectory(`${this.basePath}/metadata`);
  }

  /**
   * Save emails for an account and folder
   */
  async saveEmails(accountId: string, folder: string, emails: Email[]): Promise<void> {
    const folderPath = `${this.basePath}/emails/${accountId}/${folder}`;
    await this.ensureDirectory(folderPath);

    const filePath = `${folderPath}/emails.json`;
      const jsonString = JSON.stringify(emails, null, 2);
      
      try {
        await this.fsAPI.write(filePath, jsonString as any);
    } catch (error) {
      console.error(`[EmailStorage] Failed to save emails for ${accountId}/${folder}:`, error);
      throw error;
    }
  }

  /**
   * Load emails for an account and folder
   */
  async loadEmails(accountId: string, folder: string): Promise<Email[]> {
    const filePath = `${this.basePath}/emails/${accountId}/${folder}/emails.json`;
    
    try {
      const exists = await this.fsAPI.exists(filePath);
      if (!exists) {
        return [];
      }

      const data = await this.fsAPI.read(filePath);
      const text = typeof data === 'string' ? data : new TextDecoder().decode(new Uint8Array(data));
      return JSON.parse(text);
    } catch (error) {
      console.error(`[EmailStorage] Failed to load emails for ${accountId}/${folder}:`, error);
      return [];
    }
  }

  /**
   * Save account metadata
   */
  async saveMetadata(accountId: string, metadata: AccountMetadata): Promise<void> {
    const filePath = `${this.basePath}/metadata/${accountId}.json`;
    const jsonString = JSON.stringify(metadata, null, 2);
    
    try {
      await this.fsAPI.write(filePath, jsonString as any);
    } catch (error) {
      console.error(`[EmailStorage] Failed to save metadata for ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Load account metadata
   */
  async loadMetadata(accountId: string): Promise<AccountMetadata | null> {
    const filePath = `${this.basePath}/metadata/${accountId}.json`;
    
    try {
      const exists = await this.fsAPI.exists(filePath);
      if (!exists) {
        return null;
      }

      const data = await this.fsAPI.read(filePath);
      const text = typeof data === 'string' ? data : new TextDecoder().decode(new Uint8Array(data));
      return JSON.parse(text);
    } catch (error) {
      console.error(`[EmailStorage] Failed to load metadata for ${accountId}:`, error);
      return null;
    }
  }

  /**
   * Delete all data for an account
   */
  async deleteAccount(accountId: string): Promise<void> {
    try {
      const emailsPath = `${this.basePath}/emails/${accountId}`;
      const metadataPath = `${this.basePath}/metadata/${accountId}.json`;

      // Delete emails directory
      const emailsExists = await this.fsAPI.exists(emailsPath);
      if (emailsExists) {
        await this.fsAPI.rmdir(emailsPath, { recursive: true });
      }

      // Delete metadata file
      const metadataExists = await this.fsAPI.exists(metadataPath);
      if (metadataExists) {
        await this.fsAPI.delete(metadataPath);
      }
    } catch (error) {
      console.error(`[EmailStorage] Failed to delete account data for ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectory(path: string): Promise<void> {
    try {
      const exists = await this.fsAPI.exists(path);
      if (!exists) {
        await this.fsAPI.mkdir(path, { recursive: true });
      }
    } catch (error) {
      // Directory might already exist, ignore
    }
  }
}

