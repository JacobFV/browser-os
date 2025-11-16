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
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

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
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Set default styles
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }, [width, height]);

    // Update drawing styles when color or brush size changes
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = brushSize;
    }, [color, brushSize]);

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
      } else if (startPos) {
        // For shapes, redraw everything
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        // Copy current canvas to temp
        tempCtx.drawImage(canvas, 0, 0);

        // Draw preview shape
        tempCtx.strokeStyle = color;
        tempCtx.fillStyle = color;
        tempCtx.lineWidth = brushSize;

        if (tool === 'rectangle') {
          const width = x - startPos.x;
          const height = y - startPos.y;
          tempCtx.strokeRect(startPos.x, startPos.y, width, height);
        } else if (tool === 'circle') {
          const radius = Math.sqrt(
            Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
          );
          tempCtx.beginPath();
          tempCtx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
          tempCtx.stroke();
        } else if (tool === 'line') {
          tempCtx.beginPath();
          tempCtx.moveTo(startPos.x, startPos.y);
          tempCtx.lineTo(x, y);
          tempCtx.stroke();
        } else if (tool === 'arrow') {
          // Draw arrow line
          tempCtx.beginPath();
          tempCtx.moveTo(startPos.x, startPos.y);
          tempCtx.lineTo(x, y);
          tempCtx.stroke();
          
          // Draw arrowhead
          const angle = Math.atan2(y - startPos.y, x - startPos.x);
          const arrowLength = 15;
          const arrowAngle = Math.PI / 6;
          
          tempCtx.beginPath();
          tempCtx.moveTo(x, y);
          tempCtx.lineTo(
            x - arrowLength * Math.cos(angle - arrowAngle),
            y - arrowLength * Math.sin(angle - arrowAngle)
          );
          tempCtx.moveTo(x, y);
          tempCtx.lineTo(
            x - arrowLength * Math.cos(angle + arrowAngle),
            y - arrowLength * Math.sin(angle + arrowAngle)
          );
          tempCtx.stroke();
        } else if (tool === 'polygon') {
          // Draw polygon (triangle for now, can be extended)
          const sides = 3;
          const centerX = (startPos.x + x) / 2;
          const centerY = (startPos.y + y) / 2;
          const radius = Math.sqrt(
            Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
          ) / 2;
          
          tempCtx.beginPath();
          for (let i = 0; i <= sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const px = centerX + radius * Math.cos(angle);
            const py = centerY + radius * Math.sin(angle);
            if (i === 0) {
              tempCtx.moveTo(px, py);
            } else {
              tempCtx.lineTo(px, py);
            }
          }
          tempCtx.stroke();
        } else if (tool === 'text') {
          // Text tool - show placeholder (actual text input would need a separate UI)
          tempCtx.font = `${brushSize * 3}px Arial`;
          tempCtx.fillText('Text', startPos.x, startPos.y);
        }

        // Copy back to main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
      }
    };

    const stopDrawing = () => {
      if (!isDrawing || !startPos) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Finalize shape drawing
      if (tool === 'rectangle' || tool === 'circle' || tool === 'line') {
        // Shape is already drawn in draw() function
        // Just reset state
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
        <canvas
          ref={canvasRef}
          className="draw-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
    );
  }
);

Canvas.displayName = 'Canvas';

