import { useEffect, useRef } from 'react';
import type { Email } from '../types';

export interface UseEmailNotificationsOptions {
  emails: Map<string, Email[]>; // folderId -> emails
  activeAccountId: string | null;
  activeFolder: string;
  selectedEmailId: string | null;
  notificationAPI: any; // os.notification API
  appId: string;
  onNotificationClick?: (emailId: string) => void;
}

export function useEmailNotifications(options: UseEmailNotificationsOptions): void {
  const {
    emails,
    activeAccountId,
    activeFolder,
    selectedEmailId,
    notificationAPI,
    appId,
    onNotificationClick,
  } = options;

  const previousEmailsRef = useRef<Map<string, Email[]>>(new Map());
  const notificationIdsRef = useRef<Map<string, string>>(new Map()); // emailId -> notificationId

  useEffect(() => {
    if (!notificationAPI) return;

    // Check for new emails in inbox folder
    const inboxEmails = emails.get('inbox') || [];
    const previousInboxEmails = previousEmailsRef.current.get('inbox') || [];

    const newEmails = inboxEmails.filter(
      (email) => !previousInboxEmails.find((prev) => prev.id === email.id)
    );

    // Only show notifications for new emails when:
    // - App is not focused
    // - Email is not currently selected
    // - Email is unread
    newEmails.forEach((email) => {
      if (
        !email.read &&
        email.id !== selectedEmailId &&
        activeFolder !== 'inbox' &&
        !document.hasFocus()
      ) {
        const senderName = email.from.name || email.from.email;
        const subject = email.subject || '(No subject)';
        const preview = email.preview?.substring(0, 100) || '';

        notificationAPI
          .show({
            title: `New email from ${senderName}`,
            message: `${subject}${preview ? ` - ${preview}` : ''}`,
            priority: 'normal',
            appId,
            actions: [
              {
                label: 'Open Email',
                action: 'open-email',
                data: { emailId: email.id },
              },
              {
                label: 'Mark as Read',
                action: 'mark-read',
                data: { emailId: email.id },
              },
            ],
            metadata: {
              emailId: email.id,
              accountId: activeAccountId,
            },
          })
          .then((notification: any) => {
            notificationIdsRef.current.set(email.id, notification.id);
          })
          .catch((error: Error) => {
            console.error('[useEmailNotifications] Failed to create notification:', error);
          });
      }
    });

    // Update previous emails
    previousEmailsRef.current = new Map(emails);
  }, [emails, activeAccountId, activeFolder, selectedEmailId, notificationAPI, appId]);

  // Dismiss notifications when email is selected
  useEffect(() => {
    if (selectedEmailId && notificationIdsRef.current.has(selectedEmailId)) {
      const notificationId = notificationIdsRef.current.get(selectedEmailId);
      if (notificationId && notificationAPI) {
        notificationAPI.dismiss(notificationId).catch((error: Error) => {
          console.error('[useEmailNotifications] Failed to dismiss notification:', error);
        });
        notificationIdsRef.current.delete(selectedEmailId);
      }
    }
  }, [selectedEmailId, notificationAPI]);
}

