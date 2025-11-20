import React from 'react';
import type { Conversation } from '../types';
import './ConversationHeader.css';

export interface ConversationHeaderProps {
  conversation: Conversation | null;
  currentUserId: string;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  currentUserId,
}) => {
  if (!conversation) {
    return (
      <div className="conversation-header">
        <div className="header-content">
          <h3>Select a conversation</h3>
        </div>
      </div>
    );
  }

  const getConversationName = (): string => {
    const otherParticipants = conversation.participants.filter((p) => p !== currentUserId);
    if (otherParticipants.length === 0) {
      return 'You';
    }
    return otherParticipants.join(', ');
  };

  return (
    <div className="conversation-header">
      <div className="header-content">
        <div className="header-avatar">
          {getConversationName().charAt(0).toUpperCase()}
        </div>
        <div className="header-info">
          <h3>{getConversationName()}</h3>
          <span className="header-participants">
            {conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

