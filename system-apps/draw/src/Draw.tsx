import React, { useState, useEffect, useRef } from 'react';
import { FileSystem, IndexedDBBackend } from '@browser-os/fs';
import type { EventBus } from '@browser-os/events';
import { SaveDialog, OpenDialog } from '@browser-os/dialogs';
import { Toolbar, type DrawingTool, type ToolbarPosition } from './Toolbar';
import { KonvaCanvas, type KonvaCanvasRef } from './KonvaCanvas';
import { Menubar } from './Menubar';
import './Draw.css';

export interface DrawProps {
  windowId: string;
  appId?: string;
  eventBus?: EventBus;
}

export const Draw: React.FC<DrawProps> = ({ windowId, appId = 'draw', eventBus }) => {
  const [fs, setFs] = useState<FileSystem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>('left');
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const canvasRef = useRef<KonvaCanvasRef>(null);

  // Initialize filesystem
  useEffect(() => {
    const initFS = async () => {
      try {
        const filesystem = new FileSystem();
        const backend = new IndexedDBBackend({ dbName: 'browser-os-fs' });
        await backend.init();
        await filesystem.mount('/', backend);

        // Ensure Documents directory exists
        if (!(await filesystem.exists('/home/user/Documents'))) {
          await filesystem.mkdir('/home/user/Documents', { recursive: true });
        }

        setFs(filesystem);
        setIsInitialized(true);
      } catch (error) {
        console.error('[Draw] Failed to initialize filesystem:', error);
      }
    };

    initFS();
  }, []);

  const handleNew = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to create a new drawing?')) {
        return;
      }
    }
    canvasRef.current?.clear();
    setCurrentPath(null);
    setHasUnsavedChanges(false);
  };

  const handleOpen = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to open a new file?')) {
        return;
      }
    }
    setShowOpenDialog(true);
  };

  const handleSave = async () => {
    if (!fs || !canvasRef.current) return;

    if (currentPath) {
      await saveFile(currentPath);
    } else {
      setShowSaveDialog(true);
    }
  };

  const handleSaveAs = () => {
    setShowSaveDialog(true);
  };

  const handleExit = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to exit?')) {
        return;
      }
    }
    // Close window - this would typically be handled by the window manager
    window.close();
  };

  const saveFile = async (path: string) => {
    if (!fs || !canvasRef.current) return;

    try {
      const dataUrl = canvasRef.current.getImageData();
      if (!dataUrl) return;

      // Convert data URL to Uint8Array
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Ensure directory exists
      const dirPath = path.substring(0, path.lastIndexOf('/')) || '/';
      if (!(await fs.exists(dirPath))) {
        await fs.mkdir(dirPath, { recursive: true });
      }

      await fs.write(path, uint8Array);
      setCurrentPath(path);
      setHasUnsavedChanges(false);
      setShowSaveDialog(false);
    } catch (error) {
      alert('Failed to save file: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const loadFile = async (path: string) => {
    if (!fs || !canvasRef.current) return;

    try {
      const data = await fs.read(path);
      
      // Convert Uint8Array to blob, then to data URL
      // Create a new Uint8Array copy to ensure we have a proper ArrayBuffer
      const dataCopy = new Uint8Array(data);
      const blob = new Blob([dataCopy], { type: 'image/png' });
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        canvasRef.current?.loadImageData(dataUrl);
        setCurrentPath(path);
        setHasUnsavedChanges(false);
        setShowOpenDialog(false);
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      alert('Failed to load file: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Mark as having unsaved changes when drawing (simplified - could track actual drawing events)
  useEffect(() => {
    // This is a simplified approach - in a real app, you'd track actual drawing events
    // For now, we'll mark as changed when tool/color/brush changes
    if (isInitialized) {
      setHasUnsavedChanges(true);
    }
  }, [currentTool, currentColor, brushSize]);

  if (!isInitialized || !fs) {
    return (
      <div className="draw-loading">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="draw">
      <Menubar
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onExit={handleExit}
        onClear={() => {
          canvasRef.current?.clear();
          setHasUnsavedChanges(true);
        }}
        toolbarPosition={toolbarPosition}
        onToolbarPositionChange={setToolbarPosition}
      />
      <div className="draw-content">
        <Toolbar
          currentTool={currentTool}
          currentColor={currentColor}
          brushSize={brushSize}
          position={toolbarPosition}
          onToolChange={setCurrentTool}
          onColorChange={setCurrentColor}
          onBrushSizeChange={setBrushSize}
          onClear={() => {
            canvasRef.current?.clear();
            setHasUnsavedChanges(true);
          }}
        />
        <KonvaCanvas
          ref={canvasRef}
          tool={currentTool}
          color={currentColor}
          brushSize={brushSize}
        />
      </div>
      {showSaveDialog && eventBus && (
        <SaveDialog
          fs={fs}
          appId={appId}
          eventBus={eventBus}
          currentPath={currentPath || undefined}
          defaultExtension=".png"
          fileFilter={(path) => path.endsWith('.png')}
          onSave={saveFile}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
      {showOpenDialog && eventBus && (
        <OpenDialog
          fs={fs}
          appId={appId}
          eventBus={eventBus}
          fileFilter={(path) => path.endsWith('.png')}
          onOpen={loadFile}
          onCancel={() => setShowOpenDialog(false)}
        />
      )}
    </div>
  );
};

