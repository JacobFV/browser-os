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
}

interface LinePoint {
  x: number;
  y: number;
}

export const KonvaCanvas = forwardRef<KonvaCanvasRef, KonvaCanvasProps>(
  ({ tool, color, brushSize, width = 800, height = 600 }, ref) => {
    const stageRef = useRef<Konva.Stage>(null);
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
    const [stageRotation, setStageRotation] = useState(0);
    
    // Pan/Rotate state
    const [isPanning, setIsPanning] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null);
    const [rotateCenter, setRotateCenter] = useState<{ x: number; y: number } | null>(null);
    const [lastAngle, setLastAngle] = useState(0);
    const [spacePressed, setSpacePressed] = useState(false);

    // Track spacebar for panning
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.key === ' ') {
          setSpacePressed(true);
        }
      };
      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.key === ' ') {
          setSpacePressed(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, []);

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
        setStageRotation(0);
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
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Check for pan/rotate modifiers
      const isMiddleButton = e.evt.button === 1;
      const isRightButton = e.evt.button === 2;
      const isCtrlPressed = e.evt.ctrlKey || e.evt.metaKey;

      // Pan: Middle mouse button or Space + left click
      if (isMiddleButton || (e.evt.button === 0 && spacePressed)) {
        setIsPanning(true);
        setLastPanPoint(pos);
        e.evt.preventDefault();
        return;
      }

      // Rotate: Right mouse button or Ctrl + drag
      if (isRightButton || (e.evt.button === 0 && isCtrlPressed)) {
        setIsRotating(true);
        const container = stage.container();
        const stageBox = container.getBoundingClientRect();
        const centerX = stageBox.left + stageBox.width / 2;
        const centerY = stageBox.top + stageBox.height / 2;
        setRotateCenter({ x: centerX, y: centerY });
        const angle = Math.atan2(pos.y - stageBox.height / 2, pos.x - stageBox.width / 2);
        setLastAngle(angle);
        e.evt.preventDefault();
        return;
      }

      // Drawing tools - only proceed if not panning/rotating
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

      // Handle rotating
      if (isRotating && rotateCenter) {
        const container = stage.container();
        const stageBox = container.getBoundingClientRect();
        const mouseX = e.evt.clientX;
        const mouseY = e.evt.clientY;
        const centerX = stageBox.left + stageBox.width / 2;
        const centerY = stageBox.top + stageBox.height / 2;
        
        const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
        const deltaAngle = angle - lastAngle;
        setStageRotation((prev) => prev + (deltaAngle * 180) / Math.PI);
        setLastAngle(angle);
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
      // End panning/rotating
      if (isPanning) {
        setIsPanning(false);
        setLastPanPoint(null);
      }
      if (isRotating) {
        setIsRotating(false);
        setRotateCenter(null);
        setLastAngle(0);
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
      const clampedScale = Math.max(0.1, Math.min(5, newScale));

      setStageScale(clampedScale);
      setStageX(pointer.x - mousePointTo.x * clampedScale);
      setStageY(pointer.y - mousePointTo.y * clampedScale);
    };

    const handleContextMenu = (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Prevent default context menu when right-clicking for rotate
      e.evt.preventDefault();
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
      <div className="konva-canvas-container">
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          x={stageX}
          y={stageY}
          scaleX={stageScale}
          scaleY={stageScale}
          rotation={stageRotation}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={handleContextMenu}
          onTouchStart={(e) => {
            const touch = e.evt.touches[0];
            const pos = stageRef.current?.getPointerPosition();
            if (pos) {
              handleMouseDown({ target: { getStage: () => stageRef.current }, evt: e.evt } as any);
            }
          }}
          onTouchMove={(e) => {
            const pos = stageRef.current?.getPointerPosition();
            if (pos) {
              handleMouseMove({ target: { getStage: () => stageRef.current }, evt: e.evt } as any);
            }
          }}
          onTouchEnd={handleMouseUp}
          style={{ cursor: isPanning || spacePressed ? 'grab' : isRotating ? 'crosshair' : 'default' }}
        >
          <Layer>
            {/* Background */}
            <Rect x={0} y={0} width={width} height={height} fill="#ffffff" />
            
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

