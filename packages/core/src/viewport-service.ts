import { EventBus } from './event-bus';

export interface ViewportDimensions {
  width: number;
  height: number;
}

/**
 * Service for tracking viewport dimensions and emitting resize events
 * 
 * Tracks browser window dimensions and emits events when the viewport resizes.
 * Used by Window class for maximize operations and bounds validation.
 */
export class ViewportService {
  private dimensions: ViewportDimensions;
  private eventBus: EventBus;
  private resizeHandler?: () => void;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.dimensions = {
      width: typeof globalThis !== 'undefined' && globalThis.innerWidth ? globalThis.innerWidth : 1920,
      height: typeof globalThis !== 'undefined' && globalThis.innerHeight ? globalThis.innerHeight : 1080,
    };

    // Listen to browser resize events
    if (typeof globalThis !== 'undefined' && globalThis.addEventListener) {
      this.resizeHandler = () => {
        const newWidth = globalThis.innerWidth || 1920;
        const newHeight = globalThis.innerHeight || 1080;
        
        if (this.dimensions.width !== newWidth || this.dimensions.height !== newHeight) {
          this.dimensions = { width: newWidth, height: newHeight };
          // Emit viewport resize event (we can add this to event bus types if needed)
          // For now, we'll just update dimensions - windows can listen to window resize events
        }
      };
      
      globalThis.addEventListener('resize', this.resizeHandler);
    }
  }

  /**
   * Get current viewport dimensions
   */
  getDimensions(): ViewportDimensions {
    return { ...this.dimensions };
  }

  /**
   * Get viewport width
   */
  getWidth(): number {
    return this.dimensions.width;
  }

  /**
   * Get viewport height
   */
  getHeight(): number {
    return this.dimensions.height;
  }

  /**
   * Cleanup - remove event listeners
   */
  destroy(): void {
    if (this.resizeHandler && typeof globalThis !== 'undefined' && globalThis.removeEventListener) {
      globalThis.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = undefined;
    }
  }
}

