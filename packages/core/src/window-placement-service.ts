import { WindowBounds } from './schemas';
import { ViewportService } from './viewport-service';

export interface WindowSize {
  w: number;
  h: number;
}

export interface WindowPosition {
  x: number;
  y: number;
}

/**
 * Service for calculating optimal window placement positions
 * 
 * Implements a cascade pattern where new windows are offset from previous ones
 * to prevent overlapping. Falls back to centered placement if cascade would go off-screen.
 */
export class WindowPlacementService {
  private viewportService: ViewportService;
  private cascadeOffset: WindowPosition = { x: 30, y: 30 };
  private nextCascadePosition: WindowPosition = { x: 100, y: 100 };
  private maxCascadeAttempts = 10;

  constructor(viewportService: ViewportService) {
    this.viewportService = viewportService;
  }

  /**
   * Get the next optimal position for a window of the given size
   * Uses cascade pattern with fallback to centered placement
   */
  getNextPosition(size: WindowSize): WindowPosition {
    const viewport = this.viewportService.getDimensions();
    
    // Try cascade position first
    const cascadePos = { ...this.nextCascadePosition };
    
    // Check if cascade position would keep window on screen
    if (
      cascadePos.x + size.w <= viewport.width &&
      cascadePos.y + size.h <= viewport.height &&
      cascadePos.x >= 0 &&
      cascadePos.y >= 0
    ) {
      // Update next cascade position for next window
      this.nextCascadePosition = {
        x: cascadePos.x + this.cascadeOffset.x,
        y: cascadePos.y + this.cascadeOffset.y,
      };
      
      return cascadePos;
    }
    
    // Cascade would go off-screen, reset and center
    this.nextCascadePosition = { x: 100, y: 100 };
    
    // Center the window on screen
    const centeredX = Math.max(0, Math.floor((viewport.width - size.w) / 2));
    const centeredY = Math.max(0, Math.floor((viewport.height - size.h) / 2));
    
    return { x: centeredX, y: centeredY };
  }

  /**
   * Reset cascade position (useful when all windows are closed)
   */
  resetCascade(): void {
    this.nextCascadePosition = { x: 100, y: 100 };
  }

  /**
   * Set cascade offset (distance between cascaded windows)
   */
  setCascadeOffset(offset: WindowPosition): void {
    this.cascadeOffset = { ...offset };
  }
}

