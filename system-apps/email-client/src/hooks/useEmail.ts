import { useState, useCallback } from 'react';
import type { Email, EmailAccount, Folder } from '../types';

export interface UseEmailOptions {
  accounts: EmailAccount[];
}

export interface UseEmailReturn {
  accounts: EmailAccount[];
  activeAccountId: string | null;
  setActiveAccount: (accountId: string | null) => void;
  activeFolder: string;
  setActiveFolder: (folderId: string) => void;
  emails: Map<string, Email[]>; // folderId -> emails
  setEmails: (folderId: string, emails: Email[]) => void;
  selectedEmailId: string | null;
  setSelectedEmail: (emailId: string | null) => void;
  folders: Folder[];
  setFolders: (folders: Folder[]) => void;
  showCompose: boolean;
  setShowCompose: (show: boolean) => void;
}

export function useEmail(options: UseEmailOptions): UseEmailReturn {
  const { accounts } = options;
  
  const [activeAccountId, setActiveAccountId] = useState<string | null>(
    accounts.length > 0 ? accounts[0].id : null
  );
  const [activeFolder, setActiveFolder] = useState<string>('inbox');
  const [emails, setEmailsMap] = useState<Map<string, Email[]>>(new Map());
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showCompose, setShowCompose] = useState(false);

  const setActiveAccount = useCallback((accountId: string | null) => {
    setActiveAccountId(accountId);
    setSelectedEmailId(null);
    setActiveFolder('inbox');
  }, []);

  const setEmails = useCallback((folderId: string, emailsList: Email[]) => {
    setEmailsMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(folderId, emailsList);
      return newMap;
    });
  }, []);

  const setSelectedEmail = useCallback((emailId: string | null) => {
    setSelectedEmailId(emailId);
  }, []);

  return {
    accounts,
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
  };
}

