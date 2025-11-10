import { WindowState, WindowBounds, createId, EventBus, ViewportService, WindowPlacementService, WindowSize, WindowPosition } from '@browser-os/core';
import { WindowEvent } from '@browser-os/core';

/**
 * Window class with shared control between App and OS
 * Both App and WindowManager can modify window properties
 * Changes are synchronized via events
 */
export class Window {
  public readonly id: string;
  public readonly appId: string;
  
  private _title: string;
  private _state: WindowState;
  private _bounds: WindowBounds;
  private _workspaceId: string;
  private _z: number;
  private _payload?: Record<string, any>;
  private eventBus: EventBus;
  private viewportService: ViewportService;
  private windowPlacementService: WindowPlacementService;
  
  // Store original bounds for restore
  private _originalBounds?: WindowBounds;
  
  // Minimum window dimensions
  private static readonly MIN_WIDTH = 100;
  private static readonly MIN_HEIGHT = 100;
  
  constructor(
    appId: string,
    title: string,
    size: WindowSize,
    workspaceId: string = 'default',
    payload?: Record<string, any>,
    eventBus: EventBus,
    viewportService: ViewportService,
    windowPlacementService: WindowPlacementService,
    position?: WindowPosition
  ) {
    this.id = createId();
    this.appId = appId;
    this._title = title;
    this._state = 'floating';
    
    // Use provided position or get optimal position from placement service
    const finalPosition = position || windowPlacementService.getNextPosition(size);
    
    this._bounds = {
      x: finalPosition.x,
      y: finalPosition.y,
      w: size.w,
      h: size.h,
    };
    this._workspaceId = workspaceId;
    this._z = 0;
    this._payload = payload;
    this.eventBus = eventBus;
    this.viewportService = viewportService;
    this.windowPlacementService = windowPlacementService;
  }
  
  // Getters
  get title(): string {
    return this._title;
  }
  
  get state(): WindowState {
    return this._state;
  }
  
  get bounds(): WindowBounds {
    return { ...this._bounds };
  }
  
  get workspaceId(): string {
    return this._workspaceId;
  }
  
  get z(): number {
    return this._z;
  }
  
  get payload(): Record<string, any> | undefined {
    return this._payload ? { ...this._payload } : undefined;
  }
  
  /**
   * Constrain bounds to valid viewport range
   */
  private constrainBounds(bounds: Partial<WindowBounds>): Partial<WindowBounds> {
    const viewport = this.viewportService.getDimensions();
    const maxWidth = viewport.width;
    const maxHeight = viewport.height;
    
    const constrained: Partial<WindowBounds> = {};
    
    if (bounds.x !== undefined) {
      constrained.x = Math.max(0, Math.min(bounds.x, maxWidth - (bounds.w ?? this._bounds.w ?? Window.MIN_WIDTH)));
    }
    
    if (bounds.y !== undefined) {
      constrained.y = Math.max(0, Math.min(bounds.y, maxHeight - (bounds.h ?? this._bounds.h ?? Window.MIN_HEIGHT)));
    }
    
    if (bounds.w !== undefined) {
      constrained.w = Math.max(Window.MIN_WIDTH, Math.min(bounds.w, maxWidth));
    }
    
    if (bounds.h !== undefined) {
      constrained.h = Math.max(Window.MIN_HEIGHT, Math.min(bounds.h, maxHeight));
    }
    
    return constrained;
  }
  
  // Setters with event emission
  setTitle(title: string, source: 'app' | 'os' = 'os'): void {
    if (this._title !== title) {
      this._title = title;
      this.eventBus.emit('window', { type: 'update', winId: this.id });
    }
  }
  
  setState(state: WindowState, source: 'app' | 'os' = 'os'): void {
    if (this._state !== state) {
      const oldState = this._state;
      this._state = state;
      
      // Handle maximize - store original bounds
      if (state === 'maximized' && oldState !== 'maximized') {
        this._originalBounds = { ...this._bounds };
        const viewport = this.viewportService.getDimensions();
        this._bounds.x = 0;
        this._bounds.y = 0;
        this._bounds.w = viewport.width;
        this._bounds.h = viewport.height - 40; // Account for taskbar
      }
      
      // Handle restore - restore original bounds
      if (state === 'floating' && oldState === 'maximized' && this._originalBounds) {
        this._bounds = { ...this._originalBounds };
        this._originalBounds = undefined;
      }
      
      const eventType = state === 'minimized' ? 'minimize' :
                       state === 'maximized' ? 'maximize' :
                       state === 'fullscreen' ? 'maximize' : 'restore';
      this.eventBus.emit('window', { type: eventType as any, winId: this.id });
    }
  }
  
  setBounds(bounds: Partial<WindowBounds>, source: 'app' | 'os' = 'os'): void {
    if (this._state === 'maximized' || this._state === 'fullscreen') {
      return; // Can't modify bounds when maximized
    }
    
    // Constrain bounds to valid range
    const constrained = this.constrainBounds(bounds);
    
    let changed = false;
    if (constrained.x !== undefined && this._bounds.x !== constrained.x) {
      this._bounds.x = constrained.x;
      changed = true;
    }
    if (constrained.y !== undefined && this._bounds.y !== constrained.y) {
      this._bounds.y = constrained.y;
      changed = true;
    }
    if (constrained.w !== undefined && this._bounds.w !== constrained.w) {
      this._bounds.w = constrained.w;
      changed = true;
    }
    if (constrained.h !== undefined && this._bounds.h !== constrained.h) {
      this._bounds.h = constrained.h;
      changed = true;
    }
    
    if (changed) {
      if (constrained.x !== undefined || constrained.y !== undefined) {
        this.eventBus.emit('window', { 
          type: 'move', 
          winId: this.id, 
          x: this._bounds.x, 
          y: this._bounds.y 
        });
      }
      if (constrained.w !== undefined || constrained.h !== undefined) {
        this.eventBus.emit('window', { 
          type: 'resize', 
          winId: this.id, 
          w: this._bounds.w, 
          h: this._bounds.h 
        });
      }
    }
  }
  
  setX(x: number, source: 'app' | 'os' = 'os'): void {
    this.setBounds({ x }, source);
  }
  
  setY(y: number, source: 'app' | 'os' = 'os'): void {
    this.setBounds({ y }, source);
  }
  
  setWidth(w: number, source: 'app' | 'os' = 'os'): void {
    this.setBounds({ w }, source);
  }
  
  setHeight(h: number, source: 'app' | 'os' = 'os'): void {
    this.setBounds({ h }, source);
  }
  
  setWorkspaceId(workspaceId: string, source: 'app' | 'os' = 'os'): void {
    if (this._workspaceId !== workspaceId) {
      this._workspaceId = workspaceId;
      this.eventBus.emit('window', { type: 'update', winId: this.id });
    }
  }
  
  setZ(z: number, source: 'app' | 'os' = 'os'): void {
    if (this._z !== z) {
      this._z = z;
      this.eventBus.emit('window', { type: 'update', winId: this.id });
    }
  }
  
  setPayload(payload: Record<string, any>, source: 'app' | 'os' = 'os'): void {
    this._payload = { ...payload };
    this.eventBus.emit('window', { type: 'update', winId: this.id });
  }
  
  updatePayload(updates: Record<string, any>, source: 'app' | 'os' = 'os'): void {
    this._payload = { ...(this._payload || {}), ...updates };
    this.eventBus.emit('window', { type: 'update', winId: this.id });
  }
  
  /**
   * Minimize window
   */
  minimize(source: 'app' | 'os' = 'os'): void {
    this.setState('minimized', source);
  }
  
  /**
   * Maximize window
   */
  maximize(source: 'app' | 'os' = 'os'): void {
    this.setState('maximized', source);
  }
  
  /**
   * Restore window from minimized/maximized
   */
  restore(source: 'app' | 'os' = 'os'): void {
    this.setState('floating', source);
  }
  
  /**
   * Move window to position
   */
  moveTo(x: number, y: number, source: 'app' | 'os' = 'os'): void {
    this.setBounds({ x, y }, source);
  }
  
  /**
   * Resize window
   */
  resizeTo(w: number, h: number, source: 'app' | 'os' = 'os'): void {
    this.setBounds({ w, h }, source);
  }
  
  /**
   * Convert to plain object for serialization
   */
  toJSON(): {
    id: string;
    appId: string;
    title: string;
    state: WindowState;
    z: number;
    bounds: WindowBounds;
    workspaceId: string;
    payload?: Record<string, any>;
  } {
    return {
      id: this.id,
      appId: this.appId,
      title: this._title,
      state: this._state,
      z: this._z,
      bounds: this.bounds,
      workspaceId: this._workspaceId,
      payload: this.payload,
    };
  }
}

