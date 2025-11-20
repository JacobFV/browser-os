import React from 'react';
import DOMPurify from 'dompurify';
import type { Email } from '../types';
import './EmailRenderer.css';

export interface EmailRendererProps {
  email: Email;
}

export const EmailRenderer: React.FC<EmailRendererProps> = ({ email }) => {
  const renderBody = () => {
    if (email.bodyHtml) {
      // Sanitize HTML content
      const sanitizedHtml = DOMPurify.sanitize(email.bodyHtml, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'div', 'span', 'img'],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style'],
        ALLOW_DATA_ATTR: false,
      });

      return (
        <div
          className="email-body-html"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    }

    if (email.body) {
      // Render plain text with line breaks
      const formattedText = email.body.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < email.body!.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));

      return <div className="email-body-text">{formattedText}</div>;
    }

    return <div className="email-body-empty">No content</div>;
  };

  return (
    <div className="email-renderer">
      {renderBody()}
    </div>
  );
};

