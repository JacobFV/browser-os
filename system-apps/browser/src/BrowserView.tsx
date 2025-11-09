import React, { useState, useRef, useEffect } from 'react';
import { Toolbar, Button, Input, Separator } from '@browser-os/ui';
import { Window } from '@browser-os/windowing';
import '@browser-os/ui/dist/ui.css';
import './Browser.css';

interface BrowserViewProps {
  window: Window;
}

export const BrowserView: React.FC<BrowserViewProps> = ({ window }) => {
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
      <Toolbar>
        <Button onClick={() => iframeRef.current?.contentWindow?.history.back()}>←</Button>
        <Button onClick={() => iframeRef.current?.contentWindow?.history.forward()}>→</Button>
        <Button onClick={() => iframeRef.current?.contentWindow?.location.reload()}>↻</Button>
        <Separator orientation="vertical" />
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1 }}
          placeholder="Enter URL"
        />
        <Button onClick={handleNavigate}>Go</Button>
        {loading && <span>Loading...</span>}
      </Toolbar>
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

