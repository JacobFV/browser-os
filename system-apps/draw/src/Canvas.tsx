import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import type { DrawingTool } from './Toolbar';
import './Canvas.css';

export interface CanvasProps {
  tool: DrawingTool;
  color: string;
  brushSize: number;
  width?: number;
  height?: number;
}

export interface CanvasRef {
  clear: () => void;
  getImageData: () => string;
  loadImageData: (dataUrl: string) => Promise<void>;
}

export const Canvas = forwardRef<CanvasRef, CanvasProps>(
  ({ tool, color, brushSize, width = 800, height = 600 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
    
    // Define vector tools that use preview overlay
    const vectorTools: DrawingTool[] = ['rectangle', 'circle', 'line', 'arrow', 'polygon', 'text'];
    const isVectorTool = vectorTools.includes(tool);

    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      },
      getImageData: () => {
        const canvas = canvasRef.current;
        if (!canvas) return '';
        return canvas.toDataURL('image/png');
      },
      loadImageData: async (dataUrl: string) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        return new Promise<void>((resolve, reject) => {
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            resolve();
          };
          img.onerror = reject;
          img.src = dataUrl;
        });
      },
    }));

    // Initialize canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      const previewCanvas = previewCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas internal size
      canvas.width = width;
      canvas.height = height;
      
      // Set canvas display size
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Set default styles
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Initialize preview canvas - must match main canvas exactly
      if (previewCanvas) {
        previewCanvas.width = width;
        previewCanvas.height = height;
        previewCanvas.style.width = `${width}px`;
        previewCanvas.style.height = `${height}px`;
        
        // Initialize preview canvas context
        const previewCtx = previewCanvas.getContext('2d');
        if (previewCtx) {
          previewCtx.strokeStyle = color;
          previewCtx.fillStyle = color;
          previewCtx.lineWidth = brushSize;
          previewCtx.lineCap = 'round';
          previewCtx.lineJoin = 'round';
        }
      }
    }, [width, height, color, brushSize]);

    // Update drawing styles when color or brush size changes
    useEffect(() => {
      const canvas = canvasRef.current;
      const previewCanvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = brushSize;

      // Update preview canvas styles too
      if (previewCanvas) {
        const previewCtx = previewCanvas.getContext('2d');
        if (previewCtx) {
          previewCtx.strokeStyle = color;
          previewCtx.fillStyle = color;
          previewCtx.lineWidth = brushSize;
        }
      }
    }, [color, brushSize]);

    // Commit pending vector when tool changes or clear preview if switching away
    useEffect(() => {
      const previewCanvas = previewCanvasRef.current;
      if (!previewCanvas) return;
      
      const previewCtx = previewCanvas.getContext('2d');
      if (!previewCtx) return;

      // If currently drawing and switching tools, commit preview
      if (isDrawing && startPos) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Commit preview to main canvas
            ctx.drawImage(previewCanvas, 0, 0);
          }
        }
        // Clear preview and reset state
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        setIsDrawing(false);
        setStartPos(null);
        setLastPos(null);
      } else {
        // Just clear preview if not currently drawing
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      }
    }, [tool]);

    // Commit pending vector when canvas loses focus
    const handleBlur = () => {
      if (isDrawing && isVectorTool && startPos) {
        commitPreview();
        setIsDrawing(false);
        setStartPos(null);
        setLastPos(null);
      }
    };

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    };

    const startDrawing = (x: number, y: number) => {
      setIsDrawing(true);
      setStartPos({ x, y });
      setLastPos({ x, y });
    };

    const draw = (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx || !isDrawing) return;

      // Pixel tools draw directly to main canvas
      if (tool === 'pen' || tool === 'brush') {
        if (lastPos) {
          ctx.beginPath();
          if (tool === 'brush') {
            // Brush uses round line cap for smoother strokes
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = 0.7; // Slightly transparent for brush effect
          }
          ctx.moveTo(lastPos.x, lastPos.y);
          ctx.lineTo(x, y);
          ctx.stroke();
          if (tool === 'brush') {
            ctx.globalAlpha = 1.0;
          }
        }
        setLastPos({ x, y });
      } else if (tool === 'eraser') {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        if (lastPos) {
          ctx.beginPath();
          ctx.moveTo(lastPos.x, lastPos.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.restore();
        setLastPos({ x, y });
      } else if (isVectorTool && startPos) {
        // Vector tools draw only to preview canvas
        const previewCanvas = previewCanvasRef.current;
        if (!previewCanvas) {
          console.warn('[Canvas] Preview canvas not available');
          return;
        }
        const previewCtx = previewCanvas.getContext('2d');
        if (!previewCtx) {
          console.warn('[Canvas] Preview context not available');
          return;
        }

        // Ensure preview canvas is properly sized
        if (previewCanvas.width !== canvas.width || previewCanvas.height !== canvas.height) {
          previewCanvas.width = canvas.width;
          previewCanvas.height = canvas.height;
        }

        // Clear preview canvas
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        // Draw preview shape - ensure context is properly configured
        previewCtx.strokeStyle = color;
        previewCtx.fillStyle = color;
        previewCtx.lineWidth = brushSize;
        previewCtx.lineCap = 'round';
        previewCtx.lineJoin = 'round';

        if (tool === 'rectangle') {
          const width = x - startPos.x;
          const height = y - startPos.y;
          previewCtx.strokeRect(startPos.x, startPos.y, width, height);
        } else if (tool === 'circle') {
          const radius = Math.sqrt(
            Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
          );
          previewCtx.beginPath();
          previewCtx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
          previewCtx.stroke();
        } else if (tool === 'line') {
          previewCtx.beginPath();
          previewCtx.moveTo(startPos.x, startPos.y);
          previewCtx.lineTo(x, y);
          previewCtx.stroke();
        } else if (tool === 'arrow') {
          // Draw arrow line
          previewCtx.beginPath();
          previewCtx.moveTo(startPos.x, startPos.y);
          previewCtx.lineTo(x, y);
          previewCtx.stroke();
          
          // Draw arrowhead
          const angle = Math.atan2(y - startPos.y, x - startPos.x);
          const arrowLength = 15;
          const arrowAngle = Math.PI / 6;
          
          previewCtx.beginPath();
          previewCtx.moveTo(x, y);
          previewCtx.lineTo(
            x - arrowLength * Math.cos(angle - arrowAngle),
            y - arrowLength * Math.sin(angle - arrowAngle)
          );
          previewCtx.moveTo(x, y);
          previewCtx.lineTo(
            x - arrowLength * Math.cos(angle + arrowAngle),
            y - arrowLength * Math.sin(angle + arrowAngle)
          );
          previewCtx.stroke();
        } else if (tool === 'polygon') {
          // Draw polygon (triangle for now, can be extended)
          const sides = 3;
          const centerX = (startPos.x + x) / 2;
          const centerY = (startPos.y + y) / 2;
          const radius = Math.sqrt(
            Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
          ) / 2;
          
          previewCtx.beginPath();
          for (let i = 0; i <= sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const px = centerX + radius * Math.cos(angle);
            const py = centerY + radius * Math.sin(angle);
            if (i === 0) {
              previewCtx.moveTo(px, py);
            } else {
              previewCtx.lineTo(px, py);
            }
          }
          previewCtx.stroke();
        } else if (tool === 'text') {
          // Text tool - show placeholder (actual text input would need a separate UI)
          previewCtx.font = `${brushSize * 3}px Arial`;
          previewCtx.fillText('Text', startPos.x, startPos.y);
        }
      }
    };

    const commitPreview = () => {
      const canvas = canvasRef.current;
      const previewCanvas = previewCanvasRef.current;
      if (!canvas || !previewCanvas) {
        console.warn('[Canvas] Cannot commit preview - canvas or previewCanvas missing');
        return;
      }

      const ctx = canvas.getContext('2d');
      const previewCtx = previewCanvas.getContext('2d');
      if (!ctx || !previewCtx) {
        console.warn('[Canvas] Cannot commit preview - context missing');
        return;
      }

      // Copy preview to main canvas
      ctx.drawImage(previewCanvas, 0, 0);
      // Clear preview
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    };

    const stopDrawing = () => {
      if (!isDrawing || !startPos) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // For vector tools, commit preview to main canvas
      if (isVectorTool) {
        commitPreview();
      }

      setIsDrawing(false);
      setStartPos(null);
      setLastPos(null);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getMousePos(e);
      startDrawing(pos.x, pos.y);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getMousePos(e);
      draw(pos.x, pos.y);
    };

    const handleMouseUp = () => {
      stopDrawing();
    };

    const handleMouseLeave = () => {
      stopDrawing();
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const pos = getTouchPos(e);
      startDrawing(pos.x, pos.y);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const pos = getTouchPos(e);
      draw(pos.x, pos.y);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      stopDrawing();
    };

    return (
      <div className="draw-canvas-container">
        <div className="draw-canvas-wrapper">
          <canvas
            ref={canvasRef}
            className="draw-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onBlur={handleBlur}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          <canvas
            ref={previewCanvasRef}
            className="draw-canvas-preview"
          />
        </div>
      </div>
    );
  }
);

Canvas.displayName = 'Canvas';

