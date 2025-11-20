import React, { useState, useEffect, useRef } from 'react';
import { Camera, Monitor, Square, Save, Copy, Trash2, Download, X } from 'lucide-react';
import './Screenshot.css';

interface ScreenshotItem {
  id: string;
  dataUrl: string;
  timestamp: number;
  name: string;
}

export const Screenshot: React.FC<{ os: any }> = ({ os }) => {
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadScreenshots();
  }, []);

  const showStatus = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const loadScreenshots = async () => {
    try {
      if (os?.fs) {
        const screenshotsDir = '/home/user/Pictures/Screenshots';
        try {
          await os.fs.mkdir(screenshotsDir, { recursive: true });
          const files = await os.fs.readdir(screenshotsDir);
          const loaded: ScreenshotItem[] = [];
          
          for (const file of files) {
            if (file.endsWith('.png')) {
              try {
                const data = await os.fs.read(`${screenshotsDir}/${file}`);
                loaded.push({
                  id: file,
                  dataUrl: data,
                  timestamp: Date.now(), // In real implementation, get from file metadata
                  name: file,
                });
              } catch (err) {
                console.error(`Error loading screenshot ${file}:`, err);
              }
            }
          }
          
          setScreenshots(loaded.sort((a, b) => b.timestamp - a.timestamp));
        } catch (err) {
          // Directory doesn't exist yet, that's okay
          console.log('Screenshots directory does not exist yet');
        }
      }
    } catch (err) {
      console.error('Error loading screenshots:', err);
    }
  };

  const captureScreen = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' } as any,
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          setCurrentScreenshot(dataUrl);
          stream.getTracks().forEach(track => track.stop());
          setIsCapturing(false);
          showStatus('success', 'Screenshot captured successfully!');
        }
      };
    } catch (err: any) {
      setIsCapturing(false);
      if (err.name === 'NotAllowedError') {
        showStatus('error', 'Screen capture permission denied');
      } else {
        showStatus('error', 'Failed to capture screenshot');
      }
      console.error('Error capturing screen:', err);
    }
  };

  const captureFullscreen = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' } as any,
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          setCurrentScreenshot(dataUrl);
          stream.getTracks().forEach(track => track.stop());
          setIsCapturing(false);
          showStatus('success', 'Fullscreen screenshot captured!');
        }
      };
    } catch (err: any) {
      setIsCapturing(false);
      if (err.name === 'NotAllowedError') {
        showStatus('error', 'Screen capture permission denied');
      } else {
        showStatus('error', 'Failed to capture screenshot');
      }
      console.error('Error capturing fullscreen:', err);
    }
  };

  const captureWindow = async () => {
    // For window capture, we'll use the same API but let user select window
    await captureScreen();
  };

  const saveScreenshot = async () => {
    if (!currentScreenshot) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${timestamp}.png`;
      const screenshotsDir = '/home/user/Pictures/Screenshots';

      if (os?.fs) {
        await os.fs.mkdir(screenshotsDir, { recursive: true });
        await os.fs.write(`${screenshotsDir}/${filename}`, currentScreenshot);
        
        const newScreenshot: ScreenshotItem = {
          id: filename,
          dataUrl: currentScreenshot,
          timestamp: Date.now(),
          name: filename,
        };
        
        setScreenshots(prev => [newScreenshot, ...prev]);
        showStatus('success', `Screenshot saved as ${filename}`);
      } else {
        // Fallback: download
        downloadScreenshot();
      }
    } catch (err) {
      console.error('Error saving screenshot:', err);
      showStatus('error', 'Failed to save screenshot');
    }
  };

  const copyToClipboard = async () => {
    if (!currentScreenshot) return;

    try {
      const blob = await (await fetch(currentScreenshot)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      showStatus('success', 'Screenshot copied to clipboard!');
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      showStatus('error', 'Failed to copy to clipboard');
    }
  };

  const downloadScreenshot = () => {
    if (!currentScreenshot) return;

    const link = document.createElement('a');
    link.href = currentScreenshot;
    link.download = `screenshot-${Date.now()}.png`;
    link.click();
    showStatus('success', 'Screenshot downloaded!');
  };

  const deleteScreenshot = async (id: string) => {
    try {
      if (os?.fs) {
        const screenshotsDir = '/home/user/Pictures/Screenshots';
        await os.fs.write(`${screenshotsDir}/${id}`, '');
        // Note: In a real implementation, you'd use fs.unlink or similar
      }
      
      setScreenshots(prev => prev.filter(s => s.id !== id));
      if (currentScreenshot && screenshots.find(s => s.id === id)?.dataUrl === currentScreenshot) {
        setCurrentScreenshot(null);
      }
      showStatus('success', 'Screenshot deleted');
    } catch (err) {
      console.error('Error deleting screenshot:', err);
      showStatus('error', 'Failed to delete screenshot');
    }
  };

  const clearCurrent = () => {
    setCurrentScreenshot(null);
  };

  const viewScreenshot = (screenshot: ScreenshotItem) => {
    setCurrentScreenshot(screenshot.dataUrl);
  };

  return (
    <div className="screenshot-app">
      <div className="screenshot-header">
        <div className="screenshot-title">Screenshot</div>
      </div>

      <div className="screenshot-content">
        {statusMessage && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="capture-section">
          <div className="capture-buttons">
            <button
              className="capture-btn fullscreen"
              onClick={captureFullscreen}
              disabled={isCapturing}
            >
              <Monitor size={18} />
              Capture Fullscreen
            </button>
            <button
              className="capture-btn window"
              onClick={captureWindow}
              disabled={isCapturing}
            >
              <Square size={18} />
              Capture Window
            </button>
            <button
              className="capture-btn"
              onClick={captureScreen}
              disabled={isCapturing}
            >
              <Camera size={18} />
              Select Area
            </button>
          </div>
        </div>

        {currentScreenshot && (
          <div className="preview-section">
            <div className="preview-container">
              <img
                src={currentScreenshot}
                alt="Screenshot preview"
                className="screenshot-preview"
              />
            </div>
            <div className="preview-actions">
              <button className="action-btn save" onClick={saveScreenshot}>
                <Save size={16} />
                Save
              </button>
              <button className="action-btn copy" onClick={copyToClipboard}>
                <Copy size={16} />
                Copy
              </button>
              <button className="action-btn" onClick={downloadScreenshot}>
                <Download size={16} />
                Download
              </button>
              <button className="action-btn delete" onClick={clearCurrent}>
                <X size={16} />
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="gallery-section">
          <div className="gallery-title">Saved Screenshots</div>
          {screenshots.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📷</div>
              <div className="empty-state-text">No screenshots saved yet</div>
            </div>
          ) : (
            <div className="gallery-grid">
              {screenshots.map(screenshot => (
                <div
                  key={screenshot.id}
                  className="gallery-item"
                  onClick={() => viewScreenshot(screenshot)}
                >
                  <img src={screenshot.dataUrl} alt={screenshot.name} />
                  <div className="gallery-item-overlay">
                    <div className="gallery-item-actions">
                      <button
                        className="gallery-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.href = screenshot.dataUrl;
                          link.download = screenshot.name;
                          link.click();
                        }}
                      >
                        <Download size={16} />
                      </button>
                      <button
                        className="gallery-action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScreenshot(screenshot.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

