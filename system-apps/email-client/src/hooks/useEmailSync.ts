import { useEffect, useRef, useCallback } from 'react';
import type { EmailAccount, Email, Folder } from '../types';
import type { IEmailService } from '../services/EmailService';
import type { EmailStorage } from '../services/EmailStorage';
import type { TokenManager } from '../services/TokenManager';

export interface UseEmailSyncOptions {
  accounts: EmailAccount[];
  activeAccountId: string | null;
  emailService: IEmailService | null;
  emailStorage: EmailStorage | null;
  tokenManager: TokenManager | null;
  onEmailsReceived: (folder: string, emails: Email[]) => void;
  onFoldersReceived: (folders: Folder[]) => void;
  onSyncError: (accountId: string, error: Error) => void;
}

export function useEmailSync(options: UseEmailSyncOptions): void {
  const {
    accounts,
    activeAccountId,
    emailService,
    emailStorage,
    tokenManager,
    onEmailsReceived,
    onFoldersReceived,
    onSyncError,
  } = options;

  const syncIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastSyncRef = useRef<Map<string, number>>(new Map());
  const backoffRef = useRef<Map<string, number>>(new Map());

  const syncAccount = useCallback(async (accountId: string) => {
    if (!emailService || !emailStorage || !tokenManager) {
      return;
    }

    const account = accounts.find((a) => a.id === accountId);
    if (!account) {
      return;
    }

    try {
      // Update account status to syncing
      await tokenManager.updateAccountStatus(accountId, 'syncing');

      // Sync folders
      const folders = await emailService.getFolders();
      onFoldersReceived(folders);

      // Sync emails for each folder
      for (const folder of folders) {
        try {
          const lastSync = lastSyncRef.current.get(`${accountId}-${folder.id}`) || 0;
          const emails = await emailService.listMessages(folder.id, {
            maxResults: 50,
            since: lastSync,
          });

          // Save to storage
          await emailStorage.saveEmails(accountId, folder.id, emails);

          // Update UI
          onEmailsReceived(folder.id, emails);

          // Update last sync timestamp
          lastSyncRef.current.set(`${accountId}-${folder.id}`, Date.now());
        } catch (error) {
          console.error(`[useEmailSync] Failed to sync folder ${folder.id}:`, error);
        }
      }

      // Update account status to connected
      await tokenManager.updateAccountStatus(accountId, 'connected');
      await tokenManager.updateLastSync(accountId, Date.now());

      // Reset backoff on success
      backoffRef.current.set(accountId, 0);
    } catch (error) {
      console.error(`[useEmailSync] Sync error for account ${accountId}:`, error);
      
      // Update account status to error
      await tokenManager.updateAccountStatus(
        accountId,
        'error',
        error instanceof Error ? error.message : String(error)
      );

      onSyncError(accountId, error instanceof Error ? error : new Error(String(error)));

      // Exponential backoff
      const currentBackoff = backoffRef.current.get(accountId) || 0;
      const newBackoff = Math.min(currentBackoff * 2 || 30000, 300000); // Max 5 minutes
      backoffRef.current.set(accountId, newBackoff);
    }
  }, [emailService, emailStorage, tokenManager, accounts, onEmailsReceived, onFoldersReceived, onSyncError]);

  useEffect(() => {
    // Clear all intervals
    syncIntervalsRef.current.forEach((interval) => clearInterval(interval));
    syncIntervalsRef.current.clear();

    if (!emailService || !emailStorage || !tokenManager) {
      return;
    }

    // Set up sync intervals for each account
    accounts.forEach((account) => {
      if (account.status === 'error') {
        // Skip accounts with errors - they'll be retried with backoff
        return;
      }

      const syncInterval = () => {
        const backoff = backoffRef.current.get(account.id) || 0;
        const delay = backoff || 60000; // Default 60 seconds, or backoff delay

        const timeoutId = setTimeout(() => {
          syncAccount(account.id);
          // Schedule next sync
          syncInterval();
        }, delay);

        syncIntervalsRef.current.set(account.id, timeoutId);
      };

      // Initial sync
      syncAccount(account.id);
      // Schedule periodic syncs
      syncInterval();
    });

    return () => {
      syncIntervalsRef.current.forEach((interval) => clearInterval(interval));
      syncIntervalsRef.current.clear();
    };
  }, [accounts, emailService, emailStorage, tokenManager, syncAccount]);

  // Sync active account more frequently
  useEffect(() => {
    if (!activeAccountId || !emailService || !emailStorage || !tokenManager) {
      return;
    }

    const intervalId = setInterval(() => {
      syncAccount(activeAccountId);
    }, 30000); // 30 seconds for active account

    return () => clearInterval(intervalId);
  }, [activeAccountId, emailService, emailStorage, tokenManager, syncAccount]);
}

