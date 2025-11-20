import React, { useState } from 'react';
import type { Conversation } from '../types';
import { getMessagePreview, formatTimestamp } from '../utils/messageUtils';
import './ConversationList.css';

export interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  currentUserId: string;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  currentUserId,
  onSelectConversation,
  onCreateConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.participants.some((p) => p.toLowerCase().includes(searchLower)) ||
      conv.lastMessage?.content.toLowerCase().includes(searchLower)
    );
  });

  const getConversationName = (conversation: Conversation): string => {
    const otherParticipants = conversation.participants.filter((p) => p !== currentUserId);
    if (otherParticipants.length === 0) {
      return 'You';
    }
    return otherParticipants.join(', ');
  };

  const getUnreadCount = (conversation: Conversation): number => {
    return conversation.unreadCounts[currentUserId] || 0;
  };

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2>Conversations</h2>
        <button className="new-conversation-btn" onClick={onCreateConversation} title="New Conversation">
          +
        </button>
      </div>
      <div className="conversation-search">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="conversation-items">
        {filteredConversations.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const unreadCount = getUnreadCount(conversation);
            const isActive = conversation.id === activeConversationId;

            return (
              <div
                key={conversation.id}
                className={`conversation-item ${isActive ? 'active' : ''} ${unreadCount > 0 ? 'unread' : ''}`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="conversation-avatar">
                  {getConversationName(conversation).charAt(0).toUpperCase()}
                </div>
                <div className="conversation-content">
                  <div className="conversation-header">
                    <span className="conversation-name">{getConversationName(conversation)}</span>
                    {conversation.lastMessage && (
                      <span className="conversation-time">
                        {formatTimestamp(conversation.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="conversation-preview">
                    {conversation.lastMessage ? (
                      getMessagePreview(conversation.lastMessage)
                    ) : (
                      <span className="no-messages">No messages yet</span>
                    )}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <div className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

