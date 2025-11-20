import React, { useState } from 'react';
import type { EmailAccount, EmailProvider } from '../types';
import { OAuthFlow } from './OAuthFlow';
import './AccountManager.css';

export interface AccountManagerProps {
  accounts: EmailAccount[];
  onAddAccount: (provider: EmailProvider) => Promise<void>;
  onRemoveAccount: (accountId: string) => Promise<void>;
  onSelectAccount: (accountId: string) => void;
  activeAccountId?: string;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
  accounts,
  onAddAccount,
  onRemoveAccount,
  onSelectAccount,
  activeAccountId,
}) => {
  const [showProviderSelection, setShowProviderSelection] = useState(false);
  const [addingProvider, setAddingProvider] = useState<EmailProvider | null>(null);

  const handleAddAccount = async (provider: EmailProvider) => {
    setAddingProvider(provider);
    setShowProviderSelection(false);
    try {
      await onAddAccount(provider);
    } catch (error) {
      console.error('[AccountManager] Failed to add account:', error);
      alert(`Failed to add ${provider} account: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setAddingProvider(null);
    }
  };

  const getProviderIcon = (provider: EmailProvider): string => {
    switch (provider) {
      case 'gmail':
        return '📧';
      case 'outlook':
        return '📨';
      case 'yahoo':
        return '✉️';
      default:
        return '📬';
    }
  };

  const getStatusColor = (status: EmailAccount['status']): string => {
    switch (status) {
      case 'connected':
        return '#4caf50';
      case 'syncing':
        return '#2196f3';
      case 'error':
        return '#f44336';
      case 'disconnected':
        return '#9e9e9e';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <div className="account-manager">
      <div className="account-manager-header">
        <h2>Accounts</h2>
        <button
          className="add-account-button"
          onClick={() => setShowProviderSelection(true)}
          disabled={addingProvider !== null}
        >
          + Add Account
        </button>
      </div>

      <div className="account-list">
        {accounts.length === 0 ? (
          <div className="no-accounts">
            <p>No accounts added yet.</p>
            <p>Click "Add Account" to get started.</p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className={`account-item ${activeAccountId === account.id ? 'active' : ''}`}
              onClick={() => onSelectAccount(account.id)}
            >
              <div className="account-icon">{getProviderIcon(account.provider)}</div>
              <div className="account-info">
                <div className="account-email">{account.email}</div>
                <div className="account-provider">{account.provider}</div>
              </div>
              <div className="account-status">
                <span
                  className="status-dot"
                  style={{ backgroundColor: getStatusColor(account.status) }}
                  title={account.status}
                />
              </div>
              <button
                className="remove-account-button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Remove account ${account.email}?`)) {
                    onRemoveAccount(account.id);
                  }
                }}
                title="Remove account"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {showProviderSelection && (
        <div className="provider-selection-modal" onClick={() => setShowProviderSelection(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Select Email Provider</h3>
            <div className="provider-list">
              <button
                className="provider-button"
                onClick={() => handleAddAccount('gmail')}
                disabled={addingProvider !== null}
              >
                <span className="provider-icon">📧</span>
                <span className="provider-name">Gmail</span>
              </button>
              <button
                className="provider-button"
                onClick={() => handleAddAccount('outlook')}
                disabled={addingProvider !== null}
              >
                <span className="provider-icon">📨</span>
                <span className="provider-name">Outlook</span>
              </button>
              <button
                className="provider-button"
                onClick={() => handleAddAccount('yahoo')}
                disabled={addingProvider !== null}
              >
                <span className="provider-icon">✉️</span>
                <span className="provider-name">Yahoo Mail</span>
              </button>
            </div>
            <button
              className="cancel-button"
              onClick={() => setShowProviderSelection(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {addingProvider && (
        <OAuthFlow
          provider={addingProvider}
          onComplete={() => {
            setAddingProvider(null);
          }}
          onError={(error) => {
            console.error('[AccountManager] OAuth error:', error);
            setAddingProvider(null);
          }}
        />
      )}
    </div>
  );
};

