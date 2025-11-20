import React, { useState } from 'react';
import type { DraftEmail, Attachment } from '../types';
import './ComposeView.css';

export interface ComposeViewProps {
  initialTo?: string[];
  initialSubject?: string;
  initialBody?: string;
  onSend: (email: DraftEmail) => Promise<void>;
  onSaveDraft?: (email: DraftEmail) => Promise<void>;
  onCancel: () => void;
}

export const ComposeView: React.FC<ComposeViewProps> = ({
  initialTo = [],
  initialSubject = '',
  initialBody = '',
  onSend,
  onSaveDraft,
  onCancel,
}) => {
  const [to, setTo] = useState<string>(initialTo.join(', '));
  const [cc, setCc] = useState<string>('');
  const [bcc, setBcc] = useState<string>('');
  const [subject, setSubject] = useState<string>(initialSubject);
  const [body, setBody] = useState<string>(initialBody);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);

  const parseEmailList = (value: string): string[] => {
    return value
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  };

  const handleSend = async () => {
    const toList = parseEmailList(to);
    if (toList.length === 0) {
      alert('Please enter at least one recipient');
      return;
    }

    setSending(true);
    try {
      await onSend({
        to: toList,
        cc: cc ? parseEmailList(cc) : undefined,
        bcc: bcc ? parseEmailList(bcc) : undefined,
        subject,
        body,
        bodyHtml: body, // Simple - could be enhanced with rich text editor
        attachments: attachments.length > 0 ? attachments : undefined,
      });
    } catch (error) {
      console.error('[ComposeView] Failed to send email:', error);
      alert(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      try {
        await onSaveDraft({
          to: parseEmailList(to),
          cc: cc ? parseEmailList(cc) : undefined,
          bcc: bcc ? parseEmailList(bcc) : undefined,
          subject,
          body,
          bodyHtml: body,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
      } catch (error) {
        console.error('[ComposeView] Failed to save draft:', error);
      }
    }
  };

  const handleAttachFile = async () => {
    // In a real implementation, this would use os.dialog API to pick files
    // For now, just show a placeholder
    alert('File attachment not yet implemented. Would use OS file picker dialog.');
  };

  return (
    <div className="compose-view">
      <div className="compose-header">
        <h2>Compose Email</h2>
        <div className="compose-actions">
          {onSaveDraft && (
            <button className="save-draft-button" onClick={handleSaveDraft}>
              Save Draft
            </button>
          )}
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="send-button" onClick={handleSend} disabled={sending}>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      <div className="compose-body">
        <div className="compose-field">
          <label>To:</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
          />
        </div>

        {showCc && (
          <div className="compose-field">
            <label>CC:</label>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@example.com"
            />
          </div>
        )}

        {showBcc && (
          <div className="compose-field">
            <label>BCC:</label>
            <input
              type="text"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="bcc@example.com"
            />
          </div>
        )}

        <div className="compose-field-options">
          <button
            className="field-toggle"
            onClick={() => setShowCc(!showCc)}
          >
            {showCc ? 'Hide CC' : 'CC'}
          </button>
          <button
            className="field-toggle"
            onClick={() => setShowBcc(!showBcc)}
          >
            {showBcc ? 'Hide BCC' : 'BCC'}
          </button>
        </div>

        <div className="compose-field">
          <label>Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
          />
        </div>

        <div className="compose-field">
          <label>Body:</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Email body..."
            rows={15}
          />
        </div>

        {attachments.length > 0 && (
          <div className="compose-attachments">
            <h3>Attachments</h3>
            {attachments.map((attachment) => (
              <div key={attachment.id} className="attachment-item">
                <span>{attachment.filename}</span>
                <button onClick={() => setAttachments(attachments.filter((a) => a.id !== attachment.id))}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="compose-toolbar">
          <button className="attach-button" onClick={handleAttachFile}>
            📎 Attach File
          </button>
        </div>
      </div>
    </div>
  );
};

