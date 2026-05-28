/// <reference types="vite/client" />
import React, { useState, useRef, useEffect } from 'react';
import { Button, Input } from '@browser-os/ui';
import './Browser.css';

export interface BrowserProps {
  windowId: string;
}

export const Browser: React.FC<BrowserProps> = ({ windowId }) => {
  // Get proxy URL from environment variable
  const proxyUrl = import.meta.env.VITE_PROXY_URL || 'http://localhost:8000/proxy';
  
  const [url, setUrl] = useState('https://www.google.com');
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [history, setHistory] = useState<string[]>(['https://www.google.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /**
   * Get the proxied URL for a given target URL
   */
  const getProxiedUrl = (targetUrl: string): string => {
    // SynthUX virtual-internet pages serve HTML directly; bypass the proxy.
    const net = (window as any).__synthuxInternet;
    if (net && net.url && targetUrl.startsWith(net.url)) return targetUrl;
    return `${proxyUrl}?url=${encodeURIComponent(targetUrl)}`;
  };

  const rewriteViaVI = (target: string): string => {
    // Route any URL through the SynthUX virtual internet. github.com gets
    // a structured rewrite; everything else uses /web/<host>/... which
    // either lands on a registered service or a synthesized landing page.
    const net = (window as any).__synthuxInternet;
    if (!net || !net.enabled || !net.url) return target;
    try {
      const u = new URL(target);
      const host = u.hostname;
      if (host.endsWith('github.com')) {
        const parts = u.pathname.split('/').filter(Boolean);
        const owner = parts[0] || 'acme';
        const repo = parts[1] || 'api';
        if (parts[2] === 'pull' && parts[3]) {
          return `${net.url}/web/github/${owner}/${repo}/pull/${parts[3]}`;
        }
        const view = parts[2] === 'pulls' ? 'pulls' : (parts[2] || 'overview');
        return `${net.url}/web/github/${owner}/${repo}?view=${encodeURIComponent(view)}`;
      }
      return `${net.url}/web/${host}${u.pathname}${u.search}`;
    } catch { return target; }
  };

  const navigateToUrl = (newUrl: string) => {
    // Ensure URL has protocol
    let formattedUrl = newUrl.trim();
    if (!formattedUrl.match(/^https?:\/\//i)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    formattedUrl = rewriteViaVI(formattedUrl);

    try {
      new URL(formattedUrl); // Validate URL
      setCurrentUrl(formattedUrl);
      setLoading(true);
      setError(null);
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(formattedUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } catch (error) {
      console.error('Invalid URL:', error);
      setError('Invalid URL format');
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
      setLoading(true);
      setError(null);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrl(history[newIndex]);
      setLoading(true);
      setError(null);
    }
  };

  const handleReload = () => {
    if (iframeRef.current) {
      // Reload by setting the proxied URL again
      iframeRef.current.src = getProxiedUrl(currentUrl);
      setLoading(true);
      setError(null);
    }
  };

  // Handle iframe load events
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setLoading(false);
      setError(null);
    };

    const handleError = () => {
      setLoading(false);
      setError('Failed to load the webpage. Please check that the proxy server is running and the URL is valid.');
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    // Set a timeout to detect if page never loads
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Page load timeout. The site may be taking too long to load or the proxy server may be unavailable.');
      }
    }, 30000); // Increased timeout for proxy requests

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
      clearTimeout(timeout);
    };
  }, [currentUrl, loading]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return (
    <div className="browser">
      <div className="browser-toolbar">
        <div className="browser-nav-buttons">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={!canGoBack}
            title="Back"
          >
            ←
          </Button>
          <Button
            variant="ghost"
            onClick={handleForward}
            disabled={!canGoForward}
            title="Forward"
          >
            →
          </Button>
          <Button
            variant="ghost"
            onClick={handleReload}
            title="Reload"
          >
            ↻
          </Button>
        </div>
        <form className="browser-url-bar" onSubmit={handleSubmit}>
          <Input
            type="text"
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            placeholder="Enter URL or search"
          />
          <Button type="submit" variant="primary" title="Go">
            Go
          </Button>
        </form>
      </div>
      <div className="browser-content">
        {loading && (
          <div className="browser-loading">
            <div className="browser-loading-spinner"></div>
            <p>Loading {currentUrl}...</p>
          </div>
        )}
        {error && (
          <div className="browser-error">
            <div className="browser-error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
              </svg>
            </div>
            <h2 className="browser-error-title">Unable to Load Page</h2>
            <p className="browser-error-message">{error}</p>
            <div className="browser-error-suggestion">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
              </svg>
              <div>
                <strong>Tip:</strong> Make sure the proxy server is running at {proxyUrl}. Check your .env.local file for VITE_PROXY_URL.
              </div>
            </div>
            <div className="browser-error-actions">
              <Button 
                variant="primary"
                onClick={() => window.open(currentUrl, '_blank')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="currentColor"/>
                </svg>
                Open in New Tab
              </Button>
              <Button 
                variant="ghost"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  if (iframeRef.current) {
                    iframeRef.current.src = getProxiedUrl(currentUrl);
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                </svg>
                Retry
              </Button>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={getProxiedUrl(currentUrl)}
          className="browser-iframe"
          title="Browser content"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation"
          style={{ display: error ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
};

