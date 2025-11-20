import React, { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
}

export interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentPlayer?: string;
  enabled?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  currentPlayer = 'You',
  enabled = true,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && enabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>Chat</h3>
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${
                msg.sender === currentPlayer ? 'own-message' : ''
              }`}
            >
              <div className="message-sender">{msg.sender}</div>
              <div className="message-text">{msg.message}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          disabled={!enabled}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={!enabled || !inputValue.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

