import { WindowState, WindowBounds, createId, EventBus } from '@browser-os/core';
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
  
  // Store original bounds for restore
  private _originalBounds?: WindowBounds;
  
  constructor(
    appId: string,
    title: string,
    bounds: WindowBounds = { x: 100, y: 100, w: 800, h: 600 },
    workspaceId: string = 'default',
    payload?: Record<string, any>,
    eventBus: EventBus
  ) {
    this.id = createId();
    this.appId = appId;
    this._title = title;
    this._state = 'floating';
    this._bounds = { ...bounds };
    this._workspaceId = workspaceId;
    this._z = 0;
    this._payload = payload;
    this.eventBus = eventBus;
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
        this._bounds.x = 0;
        this._bounds.y = 0;
        this._bounds.w = globalThis.innerWidth || 1920;
        this._bounds.h = (globalThis.innerHeight || 1080) - 40;
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
    
    let changed = false;
    if (bounds.x !== undefined && this._bounds.x !== bounds.x) {
      this._bounds.x = bounds.x;
      changed = true;
    }
    if (bounds.y !== undefined && this._bounds.y !== bounds.y) {
      this._bounds.y = bounds.y;
      changed = true;
    }
    if (bounds.w !== undefined && this._bounds.w !== bounds.w) {
      this._bounds.w = bounds.w;
      changed = true;
    }
    if (bounds.h !== undefined && this._bounds.h !== bounds.h) {
      this._bounds.h = bounds.h;
      changed = true;
    }
    
    if (changed) {
      if (bounds.x !== undefined || bounds.y !== undefined) {
        this.eventBus.emit('window', { 
          type: 'move', 
          winId: this.id, 
          x: this._bounds.x, 
          y: this._bounds.y 
        });
      }
      if (bounds.w !== undefined || bounds.h !== undefined) {
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

