import React, { useState, useRef, useEffect } from 'react';
import './Browser.css';

export const BrowserApp: React.FC = () => {
  const [url, setUrl] = useState('https://example.com');
  const [currentUrl, setCurrentUrl] = useState('https://example.com');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setCurrentUrl('https://' + url);
    } else {
      setCurrentUrl(url);
    }
    setLoading(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = () => setLoading(false);
      iframe.onerror = () => {
        setLoading(false);
        alert('Failed to load page');
      };
    }
  }, [currentUrl]);

  return (
    <div className="browser-app" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="browser-toolbar" style={{ padding: '8px', borderBottom: '1px solid #ccc', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={() => iframeRef.current?.contentWindow?.history.back()}>←</button>
        <button onClick={() => iframeRef.current?.contentWindow?.history.forward()}>→</button>
        <button onClick={() => iframeRef.current?.contentWindow?.location.reload()}>↻</button>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1, padding: '4px 8px' }}
          placeholder="Enter URL"
        />
        <button onClick={handleNavigate}>Go</button>
        {loading && <span>Loading...</span>}
      </div>
      <iframe
        ref={iframeRef}
        src={currentUrl}
        style={{ flex: 1, width: '100%', border: 'none' }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
        title="Browser"
      />
    </div>
  );
};
