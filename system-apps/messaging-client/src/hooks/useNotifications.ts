import { useEffect, useRef } from 'react';
import type { Message, Conversation } from '../types';

export interface UseNotificationsOptions {
  messages: Map<string, Message[]>;
  conversations: Conversation[];
  currentUserId: string;
  activeConversationId: string | null;
  notificationAPI: any; // os.notification API
  appId: string;
  onNotificationClick?: (conversationId: string) => void;
}

/**
 * Hook to handle system notifications for new messages
 */
export function useNotifications(options: UseNotificationsOptions): void {
  const {
    messages,
    conversations,
    currentUserId,
    activeConversationId,
    notificationAPI,
    appId,
    onNotificationClick,
  } = options;

  const previousMessagesRef = useRef<Map<string, Message[]>>(new Map());
  const notificationIdsRef = useRef<Map<string, string>>(new Map()); // conversationId -> notificationId

  useEffect(() => {
    if (!notificationAPI) return;

    // Check for new messages
    messages.forEach((conversationMessages, conversationId) => {
      const previousMessages = previousMessagesRef.current.get(conversationId) || [];
      const newMessages = conversationMessages.filter(
        (msg) => !previousMessages.find((prev) => prev.id === msg.id)
      );

      // Only show notifications for messages not from current user and not in active conversation
      newMessages.forEach((message) => {
        if (
          message.senderId !== currentUserId &&
          conversationId !== activeConversationId &&
          !document.hasFocus() // Only notify when app is not focused
        ) {
          const conversation = conversations.find((c) => c.id === conversationId);
          const senderName = conversation?.participants.find((p) => p !== currentUserId) || 'Someone';

          // Create notification
          notificationAPI
            .show({
              title: senderName,
              message: message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content,
              priority: 'normal',
              appId,
              actions: [
                {
                  label: 'Open Conversation',
                  action: 'open-conversation',
                  data: { conversationId },
                },
                {
                  label: 'Mark as Read',
                  action: 'mark-read',
                  data: { conversationId },
                },
              ],
              metadata: {
                conversationId,
                messageId: message.id,
              },
            })
            .then((notification: any) => {
              notificationIdsRef.current.set(conversationId, notification.id);

              // Handle notification actions
              // Note: This would need to be handled via event bus or callback system
              // For now, we'll store the notification ID for later dismissal
            })
            .catch((error: Error) => {
              console.error('[useNotifications] Failed to create notification:', error);
            });
        }
      });
    });

    // Update previous messages
    previousMessagesRef.current = new Map(messages);
  }, [messages, conversations, currentUserId, activeConversationId, notificationAPI, appId]);

  // Dismiss notifications when conversation becomes active
  useEffect(() => {
    if (activeConversationId && notificationIdsRef.current.has(activeConversationId)) {
      const notificationId = notificationIdsRef.current.get(activeConversationId);
      if (notificationId && notificationAPI) {
        notificationAPI.dismiss(notificationId).catch((error: Error) => {
          console.error('[useNotifications] Failed to dismiss notification:', error);
        });
        notificationIdsRef.current.delete(activeConversationId);
      }
    }
  }, [activeConversationId, notificationAPI]);
}

