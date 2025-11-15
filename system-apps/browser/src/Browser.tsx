import React, { useState, useRef, useEffect } from 'react';
import './Browser.css';

export interface BrowserProps {
  windowId: string;
}

export const Browser: React.FC<BrowserProps> = ({ windowId }) => {
  const [url, setUrl] = useState('https://www.google.com');
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [history, setHistory] = useState<string[]>(['https://www.google.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigateToUrl = (newUrl: string) => {
    // Ensure URL has protocol
    let formattedUrl = newUrl.trim();
    if (!formattedUrl.match(/^https?:\/\//i)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      new URL(formattedUrl); // Validate URL
      setCurrentUrl(formattedUrl);
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(formattedUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (error) {
      console.error('Invalid URL:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToUrl(url);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrl(history[newIndex]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrl(history[newIndex]);
    }
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return (
    <div className="browser">
      <div className="browser-toolbar">
        <div className="browser-nav-buttons">
          <button
            className="browser-nav-button"
            onClick={handleBack}
            disabled={!canGoBack}
            title="Back"
          >
            ←
          </button>
          <button
            className="browser-nav-button"
            onClick={handleForward}
            disabled={!canGoForward}
            title="Forward"
          >
            →
          </button>
        </div>
        <form className="browser-url-bar" onSubmit={handleSubmit}>
          <input
            type="text"
            className="browser-url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL or search"
          />
          <button type="submit" className="browser-go-button" title="Go">
            Go
          </button>
        </form>
      </div>
      <div className="browser-content">
        <iframe
          ref={iframeRef}
          src={currentUrl}
          className="browser-iframe"
          title="Browser content"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
};

