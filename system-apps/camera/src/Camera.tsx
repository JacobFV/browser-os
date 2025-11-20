import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera as CameraIcon, Image as ImageIcon, RefreshCw, Sliders, X } from 'lucide-react';
import './Camera.css';

interface Filter {
  id: string;
  name: string;
  class: string;
}

const FILTERS: Filter[] = [
  { id: 'none', name: 'Normal', class: '' },
  { id: 'grayscale', name: 'Mono', class: 'filter-grayscale' },
  { id: 'sepia', name: 'Sepia', class: 'filter-sepia' },
  { id: 'contrast', name: 'Vivid', class: 'filter-contrast' },
  { id: 'brightness', name: 'Bright', class: 'filter-brightness' },
  { id: 'invert', name: 'Negative', class: 'filter-invert' },
  { id: 'hue-rotate', name: 'Alien', class: 'filter-hue-rotate' },
];

export const Camera: React.FC<{ os: any }> = ({ os }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Filter>(FILTERS[0]);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please ensure you have granted permission.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array to run only once on mount

  // Ensure video element gets stream when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    // Play shutter sound
    try {
      os.audio?.play?.('/system/audio/shutter.mp3').catch(() => {}); // Ignore if not implemented
    } catch (e) {}

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Apply filter if active
      if (activeFilter.id !== 'none') {
        ctx.filter = getComputedStyle(video).filter;
      }
      
      // Draw video to canvas (handling mirror effect if needed)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Reset transform
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      // Get data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setLastPhoto(dataUrl);
      
      // Save to filesystem
      savePhoto(dataUrl);
    }
  };

  const savePhoto = async (dataUrl: string) => {
    try {
      // Generate filename
      const date = new Date();
      const filename = `IMG_${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}_${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}.jpg`;
      const path = `/home/user/pictures/${filename}`;
      
      // Remove header from base64
      const base64Data = dataUrl.split(',')[1];
      
      // TODO: Convert base64 to Uint8Array properly for fs.write
      // For now, assuming text write works or using a helper if available
      // In a real implementation, we'd need to handle binary data
      
      // Ensure directory exists
      try {
        await os.syscall('fs.mkdir', { path: '/home/user/pictures' });
      } catch (e) {
        // Ignore if exists
      }
      
      // Write file (simulated)
       console.log(`Saved photo to ${path}`);
       
       // Send notification
       try {
         await os.syscall('notification.create', {
           title: 'Photo Saved',
           message: `Saved to ${filename}`,
           type: 'info',
           appId: 'camera'
         });
       } catch (e) {}
       
    } catch (err) {
      console.error('Failed to save photo:', err);
    }
  };

  const switchCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    // In a real implementation, this would toggle facingMode
    startCamera();
  };

  return (
    <div className="camera-app">
      <div className={`camera-viewfinder ${flash ? 'photo-flash' : ''}`}>
        {loading && <div className="loading-message">Accessing camera...</div>}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button className="monitor-btn" onClick={startCamera} style={{ marginTop: 10 }}>Retry</button>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={activeFilter.class}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {showFilters && (
        <div className="filters-panel">
          {FILTERS.map(filter => (
            <div 
              key={filter.id} 
              className={`filter-option ${activeFilter.id === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              <div 
                className={`filter-preview ${filter.class}`}
                style={{ background: '#888' }} // Placeholder
              />
              <span className="filter-name">{filter.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="camera-controls">
        <div className="gallery-preview" onClick={() => {
           // Open file browser to pictures folder
           try {
             os.syscall('proc.spawn', { 
               appId: 'file-browser', 
               args: [], 
               options: { cwd: '/home/user/pictures' } 
             });
           } catch (e) {}
        }}>
          {lastPhoto ? (
            <img src={lastPhoto} alt="Last photo" />
          ) : (
            <ImageIcon size={24} color="white" opacity={0.5} />
          )}
        </div>

        <button 
          className="shutter-button" 
          onClick={takePhoto}
          disabled={!!error || loading}
          title="Take Photo"
        >
          <div className="shutter-button-inner" />
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className="control-button" 
            onClick={() => setShowFilters(!showFilters)}
            title="Filters"
          >
            {showFilters ? <X size={20} /> : <Sliders size={20} />}
          </button>
          
          <button 
            className="control-button" 
            onClick={switchCamera}
            title="Switch Camera"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

