import { eventBus, CursorEvent, createId } from '@browser-os/core';

export interface Cursor {
  id: string;
  userId?: string;
  x: number;
  y: number;
  color?: string;
}

class CursorManager {
  private cursors: Map<string, Cursor> = new Map();
  private localCursorId: string;
  
  constructor() {
    this.localCursorId = createId();
    this.cursors.set(this.localCursorId, {
      id: this.localCursorId,
      x: 0,
      y: 0,
    });
  }
  
  updateLocalCursor(x: number, y: number): void {
    const cursor = this.cursors.get(this.localCursorId);
    if (cursor) {
      cursor.x = x;
      cursor.y = y;
      eventBus.emit('cursor', { type: 'move', id: this.localCursorId, x, y });
    }
  }
  
  addRemoteCursor(id: string, userId?: string, color?: string): void {
    this.cursors.set(id, {
      id,
      userId,
      x: 0,
      y: 0,
      color,
    });
    eventBus.emit('cursor', { type: 'enter', id });
  }
  
  removeRemoteCursor(id: string): void {
    this.cursors.delete(id);
    eventBus.emit('cursor', { type: 'leave', id });
  }
  
  updateRemoteCursor(id: string, x: number, y: number): void {
    const cursor = this.cursors.get(id);
    if (cursor) {
      cursor.x = x;
      cursor.y = y;
      eventBus.emit('cursor', { type: 'move', id, x, y });
    }
  }
  
  getAllCursors(): Cursor[] {
    return Array.from(this.cursors.values());
  }
  
  getLocalCursor(): Cursor | undefined {
    return this.cursors.get(this.localCursorId);
  }
  
  getRemoteCursors(): Cursor[] {
    return Array.from(this.cursors.values()).filter(c => c.id !== this.localCursorId);
  }
}

export const cursorManager = new CursorManager();

export function updateLocalCursor(x: number, y: number): void {
  cursorManager.updateLocalCursor(x, y);
}

export function addRemoteCursor(id: string, userId?: string, color?: string): void {
  cursorManager.addRemoteCursor(id, userId, color);
}

export function removeRemoteCursor(id: string): void {
  cursorManager.removeRemoteCursor(id);
}

export function updateRemoteCursor(id: string, x: number, y: number): void {
  cursorManager.updateRemoteCursor(id, x, y);
}

export function getAllCursors(): Cursor[] {
  return cursorManager.getAllCursors();
}

export function getLocalCursor(): Cursor | undefined {
  return cursorManager.getLocalCursor();
}

export function getRemoteCursors(): Cursor[] {
  return cursorManager.getRemoteCursors();
}
