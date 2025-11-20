import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { formatTimestamp, isOwnMessage } from '../utils/messageUtils';
import './MessageList.css';

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: Set<string>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  typingUsers,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessage = (message: Message, index: number) => {
    const isOwn = isOwnMessage(message, currentUserId);
    const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
    const showTimestamp =
      index === 0 ||
      message.timestamp - messages[index - 1].timestamp > 5 * 60 * 1000; // 5 minutes

    return (
      <div key={message.id} className={`message-wrapper ${isOwn ? 'own' : 'other'}`}>
        {showTimestamp && (
          <div className="message-timestamp-divider">
            <span>{formatTimestamp(message.timestamp)}</span>
          </div>
        )}
        <div className={`message ${isOwn ? 'own-message' : 'other-message'}`}>
          {!isOwn && showAvatar && (
            <div className="message-avatar">
              {message.senderId.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="message-content">
            {!isOwn && showAvatar && (
              <div className="message-sender">{message.senderId}</div>
            )}
            <div className="message-bubble">
              {message.replyTo && (
                <div className="message-reply">
                  Replying to message {message.replyTo.substring(0, 8)}...
                </div>
              )}
              <div className="message-text">{message.content}</div>
              {message.attachments && message.attachments.length > 0 && (
                <div className="message-attachments">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className="message-attachment">
                      <span>📎 {attachment.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="message-meta">
                <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                {isOwn && (
                  <span className={`message-status ${message.status || 'sent'}`}>
                    {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="message-list">
      <div className="message-list-content">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
        {typingUsers.size > 0 && (
          <div className="typing-indicator">
            <span>{Array.from(typingUsers).join(', ')} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

