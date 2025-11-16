import React from 'react';
import './NotificationBadge.css';

export interface NotificationBadgeProps {
  count: number;
  maxDisplay?: number;
  showDot?: boolean;
  onClick?: () => void;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxDisplay = 99,
  showDot = false,
  onClick,
}) => {
  if (count === 0 && !showDot) {
    return null;
  }

  const displayCount = count > maxDisplay ? `${maxDisplay}+` : count.toString();

  return (
    <div className="notification-badge" onClick={onClick}>
      {showDot && count === 0 ? (
        <div className="notification-badge-dot" />
      ) : (
        <div className="notification-badge-count">{displayCount}</div>
      )}
    </div>
  );
};

