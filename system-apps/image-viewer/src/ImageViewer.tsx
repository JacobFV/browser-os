import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  X,
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import './ImageViewer.css';

interface ImageFile {
  path: string;
  name: string;
  url: string;
}

export const ImageViewer: React.FC<{ os: any }> = ({ os }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      // Try to load images from pictures directory
      const picturesPath = '/home/user/pictures';
      const exists = await os.syscall('fs.exists', { path: picturesPath });
      if (exists) {
        const files = await os.syscall('fs.readdir', { path: picturesPath });
        const imageFiles = files
          .filter((f: any) => f.name.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i))
          .map((f: any) => ({
            path: `${picturesPath}/${f.name}`,
            name: f.name,
            url: '' // Will be loaded on demand
          }));
        setImages(imageFiles);
        if (imageFiles.length > 0) {
          await loadImageUrl(imageFiles[0], 0);
        }
      }
    } catch (e) {
      console.error('Failed to load images:', e);
    }
  };

  const loadImageUrl = async (image: ImageFile, index: number) => {
    try {
      const data = await os.syscall('fs.read', { path: image.path });
      const blob = new Blob([data], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, url } : img
      ));
    } catch (e) {
      console.error('Failed to load image:', e);
    }
  };

  const currentImage = images[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      if (!images[newIndex].url) {
        loadImageUrl(images[newIndex], newIndex);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      if (!images[newIndex].url) {
        loadImageUrl(images[newIndex], newIndex);
      }
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.25, 0.5);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === '+') handleZoomIn();
    if (e.key === '-') handleZoomOut();
    if (e.key === 'r' || e.key === 'R') handleRotate();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, zoom]);

  const handleOpenFolder = async () => {
    try {
      await os.syscall('proc.spawn', {
        appId: 'file-browser',
        args: [],
        options: { cwd: '/home/user/pictures' }
      });
    } catch (e) {
      console.error('Failed to open folder:', e);
    }
  };

  return (
    <div className="image-viewer-app">
      <div className="viewer-toolbar">
        <button className="toolbar-btn" onClick={handleOpenFolder} title="Open Folder">
          <FolderOpen size={18} />
        </button>
        <div className="toolbar-separator" />
        <button 
          className="toolbar-btn" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          title="Previous (←)"
        >
          <ChevronLeft size={18} />
        </button>
        <button 
          className="toolbar-btn" 
          onClick={handleNext} 
          disabled={currentIndex === images.length - 1}
          title="Next (→)"
        >
          <ChevronRight size={18} />
        </button>
        <div className="toolbar-separator" />
        <button className="toolbar-btn" onClick={handleZoomOut} title="Zoom Out (-)">
          <ZoomOut size={18} />
        </button>
        <button className="toolbar-btn" onClick={handleZoomIn} title="Zoom In (+)">
          <ZoomIn size={18} />
        </button>
        <button className="toolbar-btn" onClick={handleRotate} title="Rotate (R)">
          <RotateCw size={18} />
        </button>
        <div className="toolbar-separator" />
        <div className="toolbar-title">
          {currentImage ? `${currentIndex + 1} / ${images.length} - ${currentImage.name}` : 'No images'}
        </div>
      </div>

      <div className="viewer-content">
        {images.length === 0 ? (
          <div className="empty-state">
            <ImageIcon className="empty-state-icon" />
            <div className="empty-state-text">No images found</div>
            <div className="empty-state-hint">Open a folder to view images</div>
          </div>
        ) : (
          <>
            <div 
              className="image-container"
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {currentImage?.url && (
                <img
                  ref={imageRef}
                  src={currentImage.url}
                  alt={currentImage.name}
                  className={`image-view ${zoom > 1 ? 'zoomed' : ''}`}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  }}
                  draggable={false}
                />
              )}
              
              {images.length > 1 && (
                <>
                  <button
                    className="nav-button prev"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    className="nav-button next"
                    onClick={handleNext}
                    disabled={currentIndex === images.length - 1}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {currentImage && (
                <div className="image-info">
                  {currentImage.name} • {Math.round(zoom * 100)}%
                </div>
              )}

              <div className="zoom-controls">
                <button className="zoom-btn" onClick={handleZoomIn}>
                  <ZoomIn size={18} />
                </button>
                <button className="zoom-btn" onClick={handleZoomOut}>
                  <ZoomOut size={18} />
                </button>
              </div>
            </div>

            {images.length > 1 && (
              <div className="thumbnail-bar">
                <div className="thumbnail-header">Gallery</div>
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail-item ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setZoom(1);
                      setPosition({ x: 0, y: 0 });
                      setRotation(0);
                      if (!img.url) {
                        loadImageUrl(img, index);
                      }
                    }}
                  >
                    {img.url ? (
                      <img src={img.url} alt={img.name} className="thumbnail-img" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                        <ImageIcon size={24} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

