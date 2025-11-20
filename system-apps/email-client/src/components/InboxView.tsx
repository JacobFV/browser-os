import React, { useState } from 'react';
import { format } from 'date-fns';
import type { Email } from '../types';
import './InboxView.css';

export interface InboxViewProps {
  emails: Email[];
  onSelectEmail: (emailId: string) => void;
  selectedEmailId?: string;
}

type SortOption = 'date-desc' | 'date-asc' | 'subject-asc' | 'subject-desc' | 'sender-asc' | 'sender-desc';

export const InboxView: React.FC<InboxViewProps> = ({
  emails,
  onSelectEmail,
  selectedEmailId,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterUnread, setFilterUnread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const formatEmailAddress = (address: { name?: string; email: string }): string => {
    return address.name ? `${address.name} <${address.email}>` : address.email;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return format(date, 'HH:mm');
    } else if (diffDays < 7) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  const sortedAndFilteredEmails = React.useMemo(() => {
    let filtered = [...emails];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (email) =>
          email.subject.toLowerCase().includes(query) ||
          email.from.email.toLowerCase().includes(query) ||
          email.from.name?.toLowerCase().includes(query) ||
          email.preview?.toLowerCase().includes(query)
      );
    }

    // Filter unread
    if (filterUnread) {
      filtered = filtered.filter((email) => !email.read);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.timestamp - a.timestamp;
        case 'date-asc':
          return a.timestamp - b.timestamp;
        case 'subject-asc':
          return a.subject.localeCompare(b.subject);
        case 'subject-desc':
          return b.subject.localeCompare(a.subject);
        case 'sender-asc':
          return formatEmailAddress(a.from).localeCompare(formatEmailAddress(b.from));
        case 'sender-desc':
          return formatEmailAddress(b.from).localeCompare(formatEmailAddress(a.from));
        default:
          return 0;
      }
    });

    return filtered;
  }, [emails, sortBy, filterUnread, searchQuery]);

  return (
    <div className="inbox-view">
      <div className="inbox-header">
        <div className="inbox-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="date-desc">Date (newest)</option>
            <option value="date-asc">Date (oldest)</option>
            <option value="subject-asc">Subject (A-Z)</option>
            <option value="subject-desc">Subject (Z-A)</option>
            <option value="sender-asc">Sender (A-Z)</option>
            <option value="sender-desc">Sender (Z-A)</option>
          </select>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filterUnread}
              onChange={(e) => setFilterUnread(e.target.checked)}
            />
            Unread only
          </label>
        </div>
      </div>

      <div className="email-list">
        {sortedAndFilteredEmails.length === 0 ? (
          <div className="empty-state">
            <p>{searchQuery || filterUnread ? 'No emails match your filters' : 'No emails'}</p>
          </div>
        ) : (
          sortedAndFilteredEmails.map((email) => (
            <div
              key={email.id}
              className={`email-item ${!email.read ? 'unread' : ''} ${selectedEmailId === email.id ? 'selected' : ''}`}
              onClick={() => onSelectEmail(email.id)}
            >
              <div className="email-item-left">
                <div className="email-checkbox">
                  <input type="checkbox" />
                </div>
                <div className="email-star">
                  {email.starred ? '⭐' : '☆'}
                </div>
                <div className="email-sender">
                  {email.from.name || email.from.email}
                </div>
              </div>
              <div className="email-item-center">
                <div className="email-subject">
                  {email.subject}
                  {email.attachments && email.attachments.length > 0 && (
                    <span className="attachment-indicator">📎</span>
                  )}
                </div>
                <div className="email-preview">{email.preview}</div>
              </div>
              <div className="email-item-right">
                <div className="email-date">{formatDate(email.timestamp)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

