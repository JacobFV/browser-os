/**
 * Brush Engine - Advanced brush algorithms for realistic painting effects
 */

export type BrushType = 'watercolor' | 'oil' | 'charcoal' | 'airbrush' | 'marker';

export interface BrushConfig {
  type: BrushType;
  color: string;
  size: number;
  opacity?: number;
}

export interface BrushPoint {
  x: number;
  y: number;
  pressure?: number;
  speed?: number;
}

/**
 * Simple noise function for texture generation
 */
function noise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Generate random points within a circle for bristle effects
 */
function generateBristlePoints(radius: number, count: number): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    points.push({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    });
  }
  return points;
}

/**
 * Watercolor Brush - Simulates watercolor with bleeding and blending
 */
export function drawWatercolor(
  ctx: CanvasRenderingContext2D,
  from: BrushPoint,
  to: BrushPoint,
  config: BrushConfig
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = to.speed || distance;
  
  // Calculate pressure based on speed (slower = more pressure = more opacity)
  const pressure = Math.max(0.3, Math.min(1.0, 1 - speed / 50));
  const baseOpacity = (config.opacity || 1.0) * pressure * 0.6;
  
  // Number of overlapping strokes for watercolor effect
  const strokeCount = Math.max(3, Math.floor(config.size / 5));
  
  ctx.save();
  ctx.globalAlpha = baseOpacity;
  ctx.globalCompositeOperation = 'multiply';
  
  for (let i = 0; i < strokeCount; i++) {
    const offsetX = (Math.random() - 0.5) * config.size * 0.3;
    const offsetY = (Math.random() - 0.5) * config.size * 0.3;
    const strokeSize = config.size * (0.7 + Math.random() * 0.3);
    
    const gradient = ctx.createLinearGradient(
      from.x + offsetX,
      from.y + offsetY,
      to.x + offsetX,
      to.y + offsetY
    );
    
    // Create color bleeding effect
    const colorWithAlpha = (alpha: number) => {
      if (config.color.startsWith('#')) {
        const hex = config.color.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      return config.color;
    };
    
    gradient.addColorStop(0, colorWithAlpha(1.0));
    gradient.addColorStop(0.5, colorWithAlpha(1.0));
    gradient.addColorStop(1, colorWithAlpha(0.0)); // Fade to transparent
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = strokeSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(from.x + offsetX, from.y + offsetY);
    ctx.lineTo(to.x + offsetX, to.y + offsetY);
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Oil Brush - Simulates oil paint with texture and impasto
 */
export function drawOil(
  ctx: CanvasRenderingContext2D,
  from: BrushPoint,
  to: BrushPoint,
  config: BrushConfig
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Generate bristle marks
  const bristleCount = Math.max(5, Math.floor(config.size / 3));
  const bristles = generateBristlePoints(config.size / 2, bristleCount);
  
  ctx.save();
  ctx.globalAlpha = config.opacity || 0.9;
  ctx.globalCompositeOperation = 'source-over';
  
  // Draw main stroke
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  
  // Add bristle texture marks
  const steps = Math.max(1, Math.floor(distance / 5));
  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    const x = from.x + dx * t;
    const y = from.y + dy * t;
    
    bristles.forEach((bristle) => {
      const noiseValue = noise(x + bristle.x, y + bristle.y);
      const opacity = 0.3 + noiseValue * 0.4;
      
      ctx.globalAlpha = opacity * (config.opacity || 0.9);
      ctx.fillStyle = config.color;
      
      // Draw bristle mark
      ctx.beginPath();
      ctx.arc(x + bristle.x, y + bristle.y, config.size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  ctx.restore();
}

/**
 * Charcoal Brush - Simulates charcoal with grainy texture
 */
export function drawCharcoal(
  ctx: CanvasRenderingContext2D,
  from: BrushPoint,
  to: BrushPoint,
  config: BrushConfig
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const pressure = to.pressure || 0.7;
  
  // Grain density based on size
  const grainDensity = Math.max(20, Math.floor(config.size * 3));
  const steps = Math.max(1, Math.floor(distance / 3));
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  
  // Draw base stroke with variable opacity
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.size * (0.8 + pressure * 0.2);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = (config.opacity || 1.0) * (0.6 + pressure * 0.4);
  
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  
  // Add grainy texture
  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    const x = from.x + dx * t;
    const y = from.y + dy * t;
    
    // Draw random grain particles
    for (let i = 0; i < grainDensity / steps; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * config.size * 0.5;
      const grainX = x + Math.cos(angle) * radius;
      const grainY = y + Math.sin(angle) * radius;
      
      const noiseValue = noise(grainX * 10, grainY * 10);
      const grainOpacity = (config.opacity || 1.0) * pressure * noiseValue * 0.8;
      
      ctx.globalAlpha = grainOpacity;
      ctx.fillStyle = config.color;
      
      ctx.beginPath();
      ctx.arc(grainX, grainY, config.size * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

/**
 * Airbrush - Simulates airbrush with soft, diffused edges
 */
export function drawAirbrush(
  ctx: CanvasRenderingContext2D,
  from: BrushPoint,
  to: BrushPoint,
  config: BrushConfig
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = to.speed || distance;
  
  // Slower speed = more paint = higher opacity
  const pressure = Math.max(0.2, Math.min(1.0, 1 - speed / 100));
  const opacity = (config.opacity || 1.0) * pressure * 0.5;
  
  // Create soft spray pattern
  const sprayCount = Math.max(10, Math.floor(config.size * 2));
  const steps = Math.max(1, Math.floor(distance / 2));
  
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  
  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    const x = from.x + dx * t;
    const y = from.y + dy * t;
    
    // Draw spray particles
    for (let i = 0; i < sprayCount / steps; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * config.size * 0.6;
      const sprayX = x + Math.cos(angle) * radius;
      const sprayY = y + Math.sin(angle) * radius;
      
      // Create radial gradient for soft edges
      const gradient = ctx.createRadialGradient(
        sprayX,
        sprayY,
        0,
        sprayX,
        sprayY,
        config.size * 0.3
      );
      
      gradient.addColorStop(0, config.color);
      gradient.addColorStop(1, config.color + '00');
      
      ctx.globalAlpha = opacity * (0.5 + Math.random() * 0.5);
      ctx.fillStyle = gradient;
      
      ctx.beginPath();
      ctx.arc(sprayX, sprayY, config.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

/**
 * Marker Brush - Simulates marker with solid color and slight bleed
 */
export function drawMarker(
  ctx: CanvasRenderingContext2D,
  from: BrushPoint,
  to: BrushPoint,
  config: BrushConfig
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = config.opacity || 1.0;
  
  // Main solid stroke
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  
  // Add slight bleed at edges
  const bleedSize = config.size * 0.15;
  const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
  gradient.addColorStop(0, config.color + '80');
  gradient.addColorStop(0.5, config.color);
  gradient.addColorStop(1, config.color + '80');
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = config.size + bleedSize * 2;
  ctx.globalAlpha = 0.3;
  
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Main brush drawing function - routes to appropriate brush algorithm
 */
export function drawBrush(
  ctx: CanvasRenderingContext2D,
  from: BrushPoint,
  to: BrushPoint,
  config: BrushConfig
): void {
  // Calculate speed for pressure simulation
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = distance; // pixels per frame (approximate)
  
  const pointFrom: BrushPoint = { ...from, speed };
  const pointTo: BrushPoint = { ...to, speed };
  
  switch (config.type) {
    case 'watercolor':
      drawWatercolor(ctx, pointFrom, pointTo, config);
      break;
    case 'oil':
      drawOil(ctx, pointFrom, pointTo, config);
      break;
    case 'charcoal':
      drawCharcoal(ctx, pointFrom, pointTo, config);
      break;
    case 'airbrush':
      drawAirbrush(ctx, pointFrom, pointTo, config);
      break;
    case 'marker':
      drawMarker(ctx, pointFrom, pointTo, config);
      break;
    default:
      // Fallback to simple stroke
      ctx.strokeStyle = config.color;
      ctx.lineWidth = config.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
  }
}

