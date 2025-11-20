import React from 'react';
import { format } from 'date-fns';
import type { Email } from '../types';
import { EmailRenderer } from './EmailRenderer';
import './EmailDetail.css';

export interface EmailDetailProps {
  email: Email;
  onReply: (email: Email) => void;
  onForward: (email: Email) => void;
  onDelete: (emailId: string) => void;
  onMarkAsRead: (emailId: string) => void;
  onMarkAsUnread: (emailId: string) => void;
  onStar: (emailId: string) => void;
  onUnstar: (emailId: string) => void;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({
  email,
  onReply,
  onForward,
  onDelete,
  onMarkAsRead,
  onMarkAsUnread,
  onStar,
  onUnstar,
}) => {
  const formatEmailAddress = (address: { name?: string; email: string }): string => {
    return address.name ? `${address.name} <${address.email}>` : address.email;
  };

  const formatEmailAddressList = (addresses: { name?: string; email: string }[]): string => {
    return addresses.map(formatEmailAddress).join(', ');
  };

  return (
    <div className="email-detail">
      <div className="email-detail-header">
        <div className="email-detail-subject">
          <h2>{email.subject || '(No subject)'}</h2>
          <div className="email-actions">
            <button
              className="action-button"
              onClick={() => email.starred ? onUnstar(email.id) : onStar(email.id)}
              title={email.starred ? 'Unstar' : 'Star'}
            >
              {email.starred ? '⭐' : '☆'}
            </button>
            <button
              className="action-button"
              onClick={() => email.read ? onMarkAsUnread(email.id) : onMarkAsRead(email.id)}
              title={email.read ? 'Mark as unread' : 'Mark as read'}
            >
              {email.read ? '✓' : '●'}
            </button>
          </div>
        </div>
        <div className="email-detail-meta">
          <div className="email-meta-row">
            <span className="meta-label">From:</span>
            <span className="meta-value">{formatEmailAddress(email.from)}</span>
          </div>
          {email.to.length > 0 && (
            <div className="email-meta-row">
              <span className="meta-label">To:</span>
              <span className="meta-value">{formatEmailAddressList(email.to)}</span>
            </div>
          )}
          {email.cc && email.cc.length > 0 && (
            <div className="email-meta-row">
              <span className="meta-label">CC:</span>
              <span className="meta-value">{formatEmailAddressList(email.cc)}</span>
            </div>
          )}
          {email.bcc && email.bcc.length > 0 && (
            <div className="email-meta-row">
              <span className="meta-label">BCC:</span>
              <span className="meta-value">{formatEmailAddressList(email.bcc)}</span>
            </div>
          )}
          <div className="email-meta-row">
            <span className="meta-label">Date:</span>
            <span className="meta-value">
              {format(new Date(email.timestamp), 'PPpp')}
            </span>
          </div>
        </div>
        <div className="email-detail-toolbar">
          <button className="toolbar-button" onClick={() => onReply(email)}>
            Reply
          </button>
          <button className="toolbar-button" onClick={() => onForward(email)}>
            Forward
          </button>
          <button className="toolbar-button delete" onClick={() => onDelete(email.id)}>
            Delete
          </button>
        </div>
      </div>

      <div className="email-detail-body">
        {email.attachments && email.attachments.length > 0 && (
          <div className="email-attachments">
            <h3>Attachments ({email.attachments.length})</h3>
            <div className="attachment-list">
              {email.attachments.map((attachment) => (
                <div key={attachment.id} className="attachment-item">
                  <span className="attachment-icon">📎</span>
                  <span className="attachment-name">{attachment.filename}</span>
                  <span className="attachment-size">
                    {attachment.size > 1024 * 1024
                      ? `${(attachment.size / (1024 * 1024)).toFixed(2)} MB`
                      : `${(attachment.size / 1024).toFixed(2)} KB`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <EmailRenderer email={email} />
      </div>
    </div>
  );
};

