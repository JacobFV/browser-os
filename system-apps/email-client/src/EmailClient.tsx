import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EventBus } from '@browser-os/events';
import { OAuthManager } from './services/OAuthManager';
import { TokenManager } from './services/TokenManager';
import { EmailStorage } from './services/EmailStorage';
import { GmailService } from './services/GmailService';
import { OutlookService } from './services/OutlookService';
import { YahooService } from './services/YahooService';
import type { IEmailService } from './services/EmailService';
import type { EmailProvider, EmailAccount, Email, DraftEmail, Folder } from './types';
import { AccountManager } from './components/AccountManager';
import { FolderSidebar } from './components/FolderSidebar';
import { InboxView } from './components/InboxView';
import { EmailDetail } from './components/EmailDetail';
import { ComposeView } from './components/ComposeView';
import { useEmail } from './hooks/useEmail';
import { useEmailSync } from './hooks/useEmailSync';
import { useEmailNotifications } from './hooks/useEmailNotifications';
import './EmailClient.css';

export interface EmailClientProps {
  windowId?: string;
  appId?: string;
  eventBus?: EventBus;
  os?: any; // OS API with notification, fs, and network access
}

export const EmailClient: React.FC<EmailClientProps> = ({
  windowId,
  appId = 'email-client',
  eventBus,
  os,
}) => {
  const [oauthManager, setOAuthManager] = useState<OAuthManager | null>(null);
  const [tokenManager, setTokenManager] = useState<TokenManager | null>(null);
  const [emailStorage, setEmailStorage] = useState<EmailStorage | null>(null);
  const [emailService, setEmailService] = useState<IEmailService | null>(null);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize services
  useEffect(() => {
    if (!os || !os.syscall) {
      setError('OS API is required');
      return;
    }

    const initServices = async () => {
      try {
        // Create FS API wrapper
        const fsAPI = {
          read: async (path: string) => {
            const data = await os.syscall('fs.read', { path });
            if (typeof data === 'string') {
              return new TextEncoder().encode(data);
            }
            return new Uint8Array(data as number[]);
          },
          write: async (path: string, data: string | Uint8Array) => {
            let dataToWrite: string | number[];
            if (typeof data === 'string') {
              dataToWrite = data;
            } else {
              dataToWrite = Array.from(data);
            }
            await os.syscall('fs.write', { path, data: dataToWrite });
          },
          exists: async (path: string) => {
            return await os.syscall('fs.exists', { path });
          },
          mkdir: async (path: string, options?: { recursive?: boolean }) => {
            await os.syscall('fs.mkdir', { path, recursive: options?.recursive });
          },
          readdir: async (path: string) => {
            return await os.syscall('fs.readdir', { path });
          },
          delete: async (path: string) => {
            await os.syscall('fs.delete', { path });
          },
          rmdir: async (path: string, options?: { recursive?: boolean }) => {
            await os.syscall('fs.rmdir', { path, recursive: options?.recursive });
          },
        };

        // Create Network API wrapper
        const networkAPI = {
          request: async (url: string, options?: any) => {
            return await os.syscall('network.request', { url, options });
          },
        };

        // Initialize OAuth Manager
        const oauth = new OAuthManager({
          networkAPI,
          fsAPI,
        });

        // Initialize Token Manager
        const tokenMgr = new TokenManager({
          fsAPI,
          oauthManager: oauth,
        });
        await tokenMgr.initialize();

        // Initialize Email Storage
        const storage = new EmailStorage({ fsAPI });
        await storage.initialize();

        setOAuthManager(oauth);
        setTokenManager(tokenMgr);
        setEmailStorage(storage);

        // Load accounts
        const loadedAccounts = tokenMgr.getAllAccounts();
        setAccounts(loadedAccounts);

        setInitialized(true);
      } catch (error) {
        console.error('[EmailClient] Initialization error:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize email client');
      }
    };

    initServices();
  }, [os]);

  // Update email service when active account changes
  const {
    activeAccountId,
    setActiveAccount,
    activeFolder,
    setActiveFolder,
    emails,
    setEmails,
    selectedEmailId,
    setSelectedEmail,
    folders,
    setFolders,
    showCompose,
    setShowCompose,
  } = useEmail({ accounts });

  useEffect(() => {
    if (!tokenManager || !os || !activeAccountId) {
      setEmailService(null);
      return;
    }

    const account = accounts.find((a) => a.id === activeAccountId);
    if (!account) {
      setEmailService(null);
      return;
    }

    const networkAPI = {
      request: async (url: string, options?: any) => {
        return await os.syscall('network.request', { url, options });
      },
    };

    let service: IEmailService;
    switch (account.provider) {
      case 'gmail':
        service = new GmailService({ networkAPI, tokenManager, accountId: activeAccountId });
        break;
      case 'outlook':
        service = new OutlookService({ networkAPI, tokenManager, accountId: activeAccountId });
        break;
      case 'yahoo':
        service = new YahooService({ networkAPI, tokenManager, accountId: activeAccountId });
        break;
      default:
        setEmailService(null);
        return;
    }

    setEmailService(service);
  }, [activeAccountId, accounts, tokenManager, os]);

  // Email sync
  useEmailSync({
    accounts,
    activeAccountId,
    emailService,
    emailStorage,
    tokenManager,
    onEmailsReceived: (folder, newEmails) => {
      const currentEmails = emails.get(folder) || [];
      const mergedEmails = [...currentEmails, ...newEmails];
      // Remove duplicates
      const uniqueEmails = mergedEmails.filter(
        (email, index, self) => index === self.findIndex((e) => e.id === email.id)
      );
      setEmails(folder, uniqueEmails);
    },
    onFoldersReceived: (newFolders) => {
      setFolders(newFolders);
    },
    onSyncError: (accountId, error) => {
      console.error(`[EmailClient] Sync error for account ${accountId}:`, error);
    },
  });

  // Notifications
  useEmailNotifications({
    emails,
    activeAccountId,
    activeFolder,
    selectedEmailId,
    notificationAPI: os?.notification,
    appId,
    onNotificationClick: (emailId) => {
      setSelectedEmail(emailId);
    },
  });

  // Load emails from storage on mount
  useEffect(() => {
    if (!emailStorage || !activeAccountId || !activeFolder) {
      return;
    }

    emailStorage.loadEmails(activeAccountId, activeFolder).then((storedEmails) => {
      if (storedEmails.length > 0) {
        setEmails(activeFolder, storedEmails);
      }
    });
  }, [emailStorage, activeAccountId, activeFolder, setEmails]);

  // Handle add account
  const handleAddAccount = useCallback(
    async (provider: EmailProvider) => {
      if (!oauthManager || !tokenManager) {
        throw new Error('Services not initialized');
      }

      // Set OAuth client IDs (these should come from environment or config)
      // For now, we'll need them to be set externally
      const clientId = (window as any).EMAIL_OAUTH_CLIENT_IDS?.[provider];
      if (!clientId) {
        throw new Error(`OAuth client ID not configured for ${provider}. Please set EMAIL_OAUTH_CLIENT_IDS.${provider}`);
      }

      oauthManager.setClientId(provider, clientId);

      // Initiate OAuth flow
      const tokens = await oauthManager.initiateAuth(provider);

      // Get user profile to get email address
      const networkAPI = {
        request: async (url: string, options?: any) => {
          return await os.syscall('network.request', { url, options });
        },
      };

      let service: IEmailService;
      const accountId = `account-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Save tokens first
      const tempAccount: EmailAccount = {
        id: accountId,
        email: '', // Will be updated after getting profile
        provider,
        tokens,
        status: 'connected',
      };
      await tokenManager.saveAccount(tempAccount);

      // Create temporary service to get profile
      switch (provider) {
        case 'gmail':
          service = new GmailService({ networkAPI, tokenManager: tokenManager as any, accountId });
          break;
        case 'outlook':
          service = new OutlookService({ networkAPI, tokenManager: tokenManager as any, accountId });
          break;
        case 'yahoo':
          service = new YahooService({ networkAPI, tokenManager: tokenManager as any, accountId });
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const profile = await service.getProfile();

      // Update account with email
      const account: EmailAccount = {
        id: accountId,
        email: profile.email,
        provider,
        tokens,
        status: 'connected',
      };

      // Update account
      await tokenManager.saveAccount(account);
      setAccounts(tokenManager.getAllAccounts());
      setActiveAccount(accountId);
    },
    [oauthManager, tokenManager, os, setActiveAccount]
  );

  // Handle remove account
  const handleRemoveAccount = useCallback(
    async (accountId: string) => {
      if (!tokenManager || !emailStorage) {
        return;
      }

      await tokenManager.removeAccount(accountId);
      await emailStorage.deleteAccount(accountId);
      setAccounts(tokenManager.getAllAccounts());

      if (activeAccountId === accountId) {
        const remainingAccounts = tokenManager.getAllAccounts();
        setActiveAccount(remainingAccounts.length > 0 ? remainingAccounts[0].id : null);
      }
    },
    [tokenManager, emailStorage, activeAccountId, setActiveAccount]
  );

  // Handle send email
  const handleSendEmail = useCallback(
    async (draft: DraftEmail) => {
      if (!emailService) {
        throw new Error('No email service available');
      }

      await emailService.sendMessage(draft);
      setShowCompose(false);

      // Refresh emails
      if (emailService && activeFolder) {
        const newEmails = await emailService.listMessages(activeFolder);
        setEmails(activeFolder, newEmails);
      }
    },
    [emailService, activeFolder, setEmails, setShowCompose]
  );

  // Get selected email
  const selectedEmail = useMemo(() => {
    if (!selectedEmailId) return null;
    const folderEmails = emails.get(activeFolder) || [];
    return folderEmails.find((e) => e.id === selectedEmailId) || null;
  }, [selectedEmailId, emails, activeFolder]);

  // Get current folder emails
  const currentFolderEmails = emails.get(activeFolder) || [];

  if (!initialized) {
    return (
      <div className="email-client-app loading">
        <div>
          {error ? (
            <>
              <div style={{ color: '#f44336', marginBottom: '8px' }}>Error</div>
              <div style={{ fontSize: '14px', color: '#757575' }}>{error}</div>
            </>
          ) : (
            <div>Initializing email client...</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="email-client-app">
      <div className="email-layout">
        <div className="email-sidebar">
          <AccountManager
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onRemoveAccount={handleRemoveAccount}
            onSelectAccount={setActiveAccount}
            activeAccountId={activeAccountId || undefined}
          />
        </div>

        {activeAccountId && (
          <>
            <div className="email-folders">
              <FolderSidebar
                folders={folders}
                activeFolder={activeFolder}
                onSelectFolder={(folderId) => {
                  setActiveFolder(folderId);
                  setSelectedEmail(null);
                }}
              />
            </div>

            <div className="email-content">
              {showCompose ? (
                <ComposeView
                  onSend={handleSendEmail}
                  onCancel={() => setShowCompose(false)}
                />
              ) : selectedEmail ? (
                <EmailDetail
                  email={selectedEmail}
                  onReply={(email) => {
                    setShowCompose(true);
                    // Could pre-fill compose form with reply data
                  }}
                  onForward={(email) => {
                    setShowCompose(true);
                    // Could pre-fill compose form with forward data
                  }}
                  onDelete={async (emailId) => {
                    if (!emailService) return;
                    await emailService.deleteMessage(emailId);
                    const updatedEmails = currentFolderEmails.filter((e) => e.id !== emailId);
                    setEmails(activeFolder, updatedEmails);
                    setSelectedEmail(null);
                  }}
                  onMarkAsRead={async (emailId) => {
                    if (!emailService) return;
                    await emailService.markAsRead(emailId);
                    const updatedEmails = currentFolderEmails.map((e) =>
                      e.id === emailId ? { ...e, read: true } : e
                    );
                    setEmails(activeFolder, updatedEmails);
                  }}
                  onMarkAsUnread={async (emailId) => {
                    if (!emailService) return;
                    await emailService.markAsUnread(emailId);
                    const updatedEmails = currentFolderEmails.map((e) =>
                      e.id === emailId ? { ...e, read: false } : e
                    );
                    setEmails(activeFolder, updatedEmails);
                  }}
                  onStar={async (emailId) => {
                    if (!emailService) return;
                    await emailService.starMessage(emailId);
                    const updatedEmails = currentFolderEmails.map((e) =>
                      e.id === emailId ? { ...e, starred: true } : e
                    );
                    setEmails(activeFolder, updatedEmails);
                  }}
                  onUnstar={async (emailId) => {
                    if (!emailService) return;
                    await emailService.unstarMessage(emailId);
                    const updatedEmails = currentFolderEmails.map((e) =>
                      e.id === emailId ? { ...e, starred: false } : e
                    );
                    setEmails(activeFolder, updatedEmails);
                  }}
                />
              ) : (
                <>
                  <div className="email-toolbar">
                    <button className="compose-button" onClick={() => setShowCompose(true)}>
                      + Compose
                    </button>
                  </div>
                  <InboxView
                    emails={currentFolderEmails}
                    onSelectEmail={setSelectedEmail}
                    selectedEmailId={selectedEmailId || undefined}
                  />
                </>
              )}
            </div>
          </>
        )}

        {!activeAccountId && (
          <div className="email-empty-state">
            <h2>No Account Selected</h2>
            <p>Add an account to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
