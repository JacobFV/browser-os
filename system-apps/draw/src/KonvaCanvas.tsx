import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, RegularPolygon, Group, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import type { DrawingTool } from './Toolbar';
import './KonvaCanvas.css';

export interface KonvaCanvasProps {
  tool: DrawingTool;
  color: string;
  brushSize: number;
  width?: number;
  height?: number;
}

export interface KonvaCanvasRef {
  clear: () => void;
  getImageData: () => string;
  loadImageData: (dataUrl: string) => Promise<void>;
  resetTransform: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (scale: number) => void;
  fitToWindow: () => void;
  actualSize: () => void;
}

interface LinePoint {
  x: number;
  y: number;
}

export const KonvaCanvas = forwardRef<KonvaCanvasRef, KonvaCanvasProps>(
  ({ tool, color, brushSize, width = 800, height = 600 }, ref) => {
    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
    const [lines, setLines] = useState<Array<{ tool: DrawingTool; points: number[]; color: string; strokeWidth: number }>>([]);
    const [shapes, setShapes] = useState<Array<{
      type: DrawingTool;
      x: number;
      y: number;
      width?: number;
      height?: number;
      radius?: number;
      points?: number[];
      color: string;
      strokeWidth: number;
    }>>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentLine, setCurrentLine] = useState<number[]>([]);
    const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
    const [previewShape, setPreviewShape] = useState<{
      type: DrawingTool;
      x: number;
      y: number;
      width?: number;
      height?: number;
      radius?: number;
      points?: number[];
    } | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    
    // Canvas transform state
    const [stageX, setStageX] = useState(0);
    const [stageY, setStageY] = useState(0);
    const [stageScale, setStageScale] = useState(1);
    
    // Refs to track current transform for imperative methods
    const stageXRef = useRef(0);
    const stageYRef = useRef(0);
    const stageScaleRef = useRef(1);
    
    // Keep refs in sync with state
    useEffect(() => {
      stageXRef.current = stageX;
    }, [stageX]);
    useEffect(() => {
      stageYRef.current = stageY;
    }, [stageY]);
    useEffect(() => {
      stageScaleRef.current = stageScale;
    }, [stageScale]);
    
    // Pan state
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null);
    
    // Multitouch gesture state
    const [touchPoints, setTouchPoints] = useState<Map<number, { x: number; y: number }>>(new Map());
    const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null);
    const [lastPinchCenter, setLastPinchCenter] = useState<{ x: number; y: number } | null>(null);
    const [isGestureMode, setIsGestureMode] = useState(false);

    // Track container size changes
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const updateSize = () => {
        const rect = container.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      };

      updateSize();
      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
      };
    }, []);


    // Helper function to zoom at a specific point
    const zoomAtPoint = (scale: number, pointX: number, pointY: number) => {
      const oldScale = stageScaleRef.current;
      const oldX = stageXRef.current;
      const oldY = stageYRef.current;
      const clampedScale = Math.max(0.1, Math.min(10, scale));
      
      const mousePointTo = {
        x: (pointX - oldX) / oldScale,
        y: (pointY - oldY) / oldScale,
      };

      setStageScale(clampedScale);
      setStageX(pointX - mousePointTo.x * clampedScale);
      setStageY(pointY - mousePointTo.y * clampedScale);
    };

    useImperativeHandle(ref, () => ({
      clear: () => {
        setLines([]);
        setShapes([]);
        setCurrentLine([]);
        setPreviewShape(null);
        setBackgroundImage(null);
      },
      resetTransform: () => {
        setStageX(0);
        setStageY(0);
        setStageScale(1);
      },
      zoomIn: () => {
        const stage = stageRef.current;
        if (!stage) return;
        const pointer = stage.getPointerPosition();
        const currentScale = stageScaleRef.current;
        if (pointer) {
          zoomAtPoint(currentScale * 1.2, pointer.x, pointer.y);
        } else {
          // Zoom at center if no pointer position
          zoomAtPoint(currentScale * 1.2, containerSize.width / 2, containerSize.height / 2);
        }
      },
      zoomOut: () => {
        const stage = stageRef.current;
        if (!stage) return;
        const pointer = stage.getPointerPosition();
        const currentScale = stageScaleRef.current;
        if (pointer) {
          zoomAtPoint(currentScale / 1.2, pointer.x, pointer.y);
        } else {
          // Zoom at center if no pointer position
          zoomAtPoint(currentScale / 1.2, containerSize.width / 2, containerSize.height / 2);
        }
      },
      zoomTo: (scale: number) => {
        const clampedScale = Math.max(0.1, Math.min(10, scale));
        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;
        zoomAtPoint(clampedScale, centerX, centerY);
      },
      fitToWindow: () => {
        const stage = stageRef.current;
        if (!stage) return;
        
        // Calculate content bounds
        const contentWidth = width;
        const contentHeight = height;
        
        // Calculate scale to fit
        const scaleX = containerSize.width / contentWidth;
        const scaleY = containerSize.height / contentHeight;
        const fitScale = Math.min(scaleX, scaleY) * 0.9; // 90% to add some padding
        
        // Center the canvas
        const newScale = Math.max(0.1, Math.min(10, fitScale));
        const newX = (containerSize.width - contentWidth * newScale) / 2;
        const newY = (containerSize.height - contentHeight * newScale) / 2;
        
        setStageScale(newScale);
        setStageX(newX);
        setStageY(newY);
      },
      actualSize: () => {
        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;
        zoomAtPoint(1, centerX, centerY);
      },
      getImageData: () => {
        const stage = stageRef.current;
        if (!stage) return '';
        return stage.toDataURL({ pixelRatio: 2 });
      },
      loadImageData: async (dataUrl: string) => {
        const stage = stageRef.current;
        if (!stage) return;

        const img = new Image();
        return new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Clear existing drawings
            setLines([]);
            setShapes([]);
            setCurrentLine([]);
            setPreviewShape(null);
            
            // Set background image
            setBackgroundImage(img);
            resolve();
          };
          img.onerror = reject;
          img.src = dataUrl;
        });
      },
    }));

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Don't handle if in gesture mode
      if (isGestureMode) return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Check for pan modifiers
      const isMiddleButton = e.evt.button === 1;
      const isCtrlPressed = e.evt.ctrlKey || e.evt.metaKey;

      // Pan: Middle mouse button or Ctrl + left click
      if (isMiddleButton || (e.evt.button === 0 && isCtrlPressed)) {
        setIsPanning(true);
        setLastPanPoint(pos);
        e.evt.preventDefault();
        return;
      }

      // Drawing tools - only proceed if not panning
      const vectorTools: DrawingTool[] = ['rectangle', 'circle', 'line', 'arrow', 'polygon', 'text'];
      const isVectorTool = vectorTools.includes(tool);

      if (tool === 'pen' || tool === 'brush' || tool === 'eraser') {
        setIsDrawing(true);
        setCurrentLine([pos.x, pos.y]);
      } else if (isVectorTool) {
        setShapeStart(pos);
        setPreviewShape({ type: tool, x: pos.x, y: pos.y });
      }
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Don't handle if in gesture mode
      if (isGestureMode) return;
      
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Handle panning
      if (isPanning && lastPanPoint) {
        const dx = pos.x - lastPanPoint.x;
        const dy = pos.y - lastPanPoint.y;
        setStageX((prev) => prev + dx);
        setStageY((prev) => prev + dy);
        setLastPanPoint(pos);
        e.evt.preventDefault();
        return;
      }

      // Drawing tools
      if (isDrawing && (tool === 'pen' || tool === 'brush' || tool === 'eraser')) {
        setCurrentLine((prev) => [...prev, pos.x, pos.y]);
      } else if (shapeStart && previewShape) {
        const dx = pos.x - shapeStart.x;
        const dy = pos.y - shapeStart.y;

        if (tool === 'rectangle') {
          setPreviewShape({ ...previewShape, width: dx, height: dy });
        } else if (tool === 'circle') {
          const radius = Math.sqrt(dx * dx + dy * dy);
          setPreviewShape({ ...previewShape, radius });
        } else if (tool === 'line' || tool === 'arrow') {
          setPreviewShape({ ...previewShape, width: dx, height: dy });
        } else if (tool === 'polygon') {
          const radius = Math.sqrt(dx * dx + dy * dy) / 2;
          setPreviewShape({ ...previewShape, radius });
        }
      }
    };

    const handleMouseUp = () => {
      // End panning
      if (isPanning) {
        setIsPanning(false);
        setLastPanPoint(null);
      }

      // Handle drawing completion
      if (isDrawing && currentLine.length > 0) {
        setLines((prev) => [
          ...prev,
          {
            tool,
            points: currentLine,
            color: tool === 'eraser' ? '#ffffff' : color,
            strokeWidth: brushSize,
          },
        ]);
        setCurrentLine([]);
        setIsDrawing(false);
      } else if (shapeStart && previewShape) {
        const vectorTools: DrawingTool[] = ['rectangle', 'circle', 'line', 'arrow', 'polygon'];
        if (vectorTools.includes(tool)) {
          setShapes((prev) => [
            ...prev,
            {
              type: tool,
              x: previewShape.x,
              y: previewShape.y,
              width: previewShape.width,
              height: previewShape.height,
              radius: previewShape.radius,
              color,
              strokeWidth: brushSize,
            },
          ]);
        }
        setShapeStart(null);
        setPreviewShape(null);
      }
    };

    const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const scaleBy = 1.1;
      const oldScale = stageScale;
      const mousePointTo = {
        x: (pointer.x - stageX) / oldScale,
        y: (pointer.y - stageY) / oldScale,
      };

      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      const clampedScale = Math.max(0.1, Math.min(10, newScale));

      setStageScale(clampedScale);
      setStageX(pointer.x - mousePointTo.x * clampedScale);
      setStageY(pointer.y - mousePointTo.y * clampedScale);
    };

    // Multitouch gesture handlers
    const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    const getCenter = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    };

    const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const touches = e.evt.touches;
      const newTouchPoints = new Map<number, { x: number; y: number }>();
      const container = stage.container();
      const rect = container.getBoundingClientRect();

      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        newTouchPoints.set(touch.identifier, { x, y });
      }

      setTouchPoints(newTouchPoints);

      // If two touches, enter gesture mode
      if (newTouchPoints.size === 2) {
        setIsGestureMode(true);
        const points = Array.from(newTouchPoints.values());
        const distance = getDistance(points[0], points[1]);
        const center = getCenter(points[0], points[1]);
        setLastPinchDistance(distance);
        setLastPinchCenter(center);
        e.evt.preventDefault();
      } else if (newTouchPoints.size === 1 && !isGestureMode) {
        // Single touch - allow drawing
        const point = Array.from(newTouchPoints.values())[0];
        // Create a synthetic mouse event for drawing
        const syntheticEvent = {
          target: { getStage: () => stage },
          evt: {
            ...e.evt,
            clientX: rect.left + point.x,
            clientY: rect.top + point.y,
            button: 0,
            ctrlKey: false,
            metaKey: false,
          },
        } as any;
        // Temporarily set pointer position for Konva
        const oldPos = stage.getPointerPosition();
        stage.setPointersPositions([{ x: point.x, y: point.y }]);
        handleMouseDown(syntheticEvent);
        if (oldPos) {
          stage.setPointersPositions([{ x: oldPos.x, y: oldPos.y }]);
        }
      }
    };

    const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const touches = e.evt.touches;
      const newTouchPoints = new Map<number, { x: number; y: number }>();

      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const container = stage.container();
        const rect = container.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        newTouchPoints.set(touch.identifier, { x, y });
      }

      setTouchPoints(newTouchPoints);

      // Handle two-finger gestures
      if (newTouchPoints.size === 2 && lastPinchDistance !== null && lastPinchCenter) {
        const points = Array.from(newTouchPoints.values());
        const distance = getDistance(points[0], points[1]);
        const center = getCenter(points[0], points[1]);

        // Pinch to zoom
        if (lastPinchDistance > 0) {
          const scaleChange = distance / lastPinchDistance;
          const newScale = stageScale * scaleChange;
          const clampedScale = Math.max(0.1, Math.min(10, newScale));
          
          // Calculate zoom center in stage coordinates
          const zoomCenterX = center.x;
          const zoomCenterY = center.y;
          const mousePointTo = {
            x: (zoomCenterX - stageX) / stageScale,
            y: (zoomCenterY - stageY) / stageScale,
          };

          setStageScale(clampedScale);
          setStageX(zoomCenterX - mousePointTo.x * clampedScale);
          setStageY(zoomCenterY - mousePointTo.y * clampedScale);
        }

        // Two-finger pan
        const panDx = center.x - lastPinchCenter.x;
        const panDy = center.y - lastPinchCenter.y;
        setStageX((prev) => prev + panDx);
        setStageY((prev) => prev + panDy);

        setLastPinchDistance(distance);
        setLastPinchCenter(center);
        e.evt.preventDefault();
      } else if (newTouchPoints.size === 1 && !isGestureMode) {
        // Single touch - allow drawing
        const point = Array.from(newTouchPoints.values())[0];
        const container = stage.container();
        const rect = container.getBoundingClientRect();
        const syntheticEvent = {
          target: { getStage: () => stage },
          evt: {
            ...e.evt,
            clientX: rect.left + point.x,
            clientY: rect.top + point.y,
            button: 0,
            ctrlKey: false,
            metaKey: false,
          },
        } as any;
        stage.setPointersPositions([{ x: point.x, y: point.y }]);
        handleMouseMove(syntheticEvent);
      }
    };

    const handleTouchEnd = (e: Konva.KonvaEventObject<TouchEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const touches = e.evt.touches;
      const newTouchPoints = new Map<number, { x: number; y: number }>();

      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const container = stage.container();
        const rect = container.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        newTouchPoints.set(touch.identifier, { x, y });
      }

      setTouchPoints(newTouchPoints);

      // Exit gesture mode if less than 2 touches
      if (newTouchPoints.size < 2) {
        setIsGestureMode(false);
        setLastPinchDistance(null);
        setLastPinchCenter(null);
        
        // End drawing if single touch ended
        if (newTouchPoints.size === 0) {
          handleMouseUp();
        }
      } else if (newTouchPoints.size === 2) {
        // Recalculate pinch state for remaining two touches
        const points = Array.from(newTouchPoints.values());
        const distance = getDistance(points[0], points[1]);
        const center = getCenter(points[0], points[1]);
        setLastPinchDistance(distance);
        setLastPinchCenter(center);
      }
    };

    const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Allow default context menu
    };

    const renderShape = (
      shape: {
        type: DrawingTool;
        x: number;
        y: number;
        width?: number;
        height?: number;
        radius?: number;
        color: string;
        strokeWidth: number;
      },
      isPreview = false
    ) => {
      const opacity = isPreview ? 0.7 : 1;
      const strokeColor = isPreview ? color : shape.color;

      switch (shape.type) {
        case 'rectangle':
          return (
            <Rect
              x={shape.x}
              y={shape.y}
              width={shape.width || 0}
              height={shape.height || 0}
              stroke={strokeColor}
              strokeWidth={shape.strokeWidth}
              fill="transparent"
              opacity={opacity}
            />
          );
        case 'circle':
          return (
            <Circle
              x={shape.x}
              y={shape.y}
              radius={shape.radius || 0}
              stroke={strokeColor}
              strokeWidth={shape.strokeWidth}
              fill="transparent"
              opacity={opacity}
            />
          );
        case 'line':
          return (
            <Line
              points={[shape.x, shape.y, shape.x + (shape.width || 0), shape.y + (shape.height || 0)]}
              stroke={strokeColor}
              strokeWidth={shape.strokeWidth}
              opacity={opacity}
            />
          );
        case 'arrow':
          return (
            <Arrow
              points={[shape.x, shape.y, shape.x + (shape.width || 0), shape.y + (shape.height || 0)]}
              stroke={strokeColor}
              strokeWidth={shape.strokeWidth}
              fill={strokeColor}
              opacity={opacity}
              pointerLength={15}
              pointerWidth={15}
            />
          );
        case 'polygon':
          return (
            <RegularPolygon
              x={shape.x + (shape.width || 0) / 2}
              y={shape.y + (shape.height || 0) / 2}
              sides={3}
              radius={shape.radius || 0}
              stroke={strokeColor}
              strokeWidth={shape.strokeWidth}
              fill="transparent"
              opacity={opacity}
            />
          );
        default:
          return null;
      }
    };

    return (
      <div className="konva-canvas-container" ref={containerRef}>
        <Stage
          ref={stageRef}
          width={containerSize.width}
          height={containerSize.height}
          x={stageX}
          y={stageY}
          scaleX={stageScale}
          scaleY={stageScale}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={handleContextMenu}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: isPanning ? 'grab' : isGestureMode ? 'move' : 'default' }}
        >
          <Layer>
            {/* Background - extend beyond canvas bounds for panning */}
            <Rect x={-10000} y={-10000} width={20000} height={20000} fill="#ffffff" listening={false} />
            
            {/* Canvas content area */}
            {/* Background image if loaded */}
            {backgroundImage && (
              <KonvaImage
                image={backgroundImage}
                x={0}
                y={0}
                width={width}
                height={height}
              />
            )}
            
            {/* Existing lines */}
            {lines.map((line, i) => (
              <Line
                key={`line-${i}`}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                tension={line.tool === 'brush' ? 0.5 : 0}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
              />
            ))}

            {/* Current drawing line */}
            {currentLine.length > 0 && (
              <Line
                points={currentLine}
                stroke={tool === 'eraser' ? '#ffffff' : color}
                strokeWidth={brushSize}
                tension={tool === 'brush' ? 0.5 : 0}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={tool === 'eraser' ? 'destination-out' : 'source-over'}
              />
            )}

            {/* Existing shapes */}
            {shapes.map((shape, i) => renderShape(shape, false))}

            {/* Preview shape */}
            {previewShape && shapeStart && (
              <Group>
                {renderShape(
                  {
                    type: previewShape.type,
                    x: previewShape.x,
                    y: previewShape.y,
                    width: previewShape.width,
                    height: previewShape.height,
                    radius: previewShape.radius,
                    color,
                    strokeWidth: brushSize,
                  },
                  true
                )}
              </Group>
            )}
          </Layer>
        </Stage>
      </div>
    );
  }
);

KonvaCanvas.displayName = 'KonvaCanvas';

