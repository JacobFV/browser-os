import { CursorEvent, createId } from '@browser-os/core';
import { eventBus } from '@browser-os/core';

export interface CursorPresence {
  id: string;
  name?: string;
  color: string;
  pos?: { x: number; y: number };
  winId?: string;
  selection?: any;
  agent?: boolean;
}

class CursorManager {
  private presences: Map<string, CursorPresence> = new Map();
  private localId: string = createId();

  join(options: { workspaceId: string; user?: { name?: string } }): string {
    const presence: CursorPresence = {
      id: this.localId,
      name: options.user?.name,
      color: this.generateColor(this.localId),
      agent: false,
    };
    this.presences.set(this.localId, presence);
    return this.localId;
  }

  update(id: string, updates: Partial<CursorPresence>): void {
    const presence = this.presences.get(id);
    if (presence) {
      Object.assign(presence, updates);
      if (updates.pos) {
        eventBus.emit('cursor', { type: 'move', id, x: updates.pos.x, y: updates.pos.y });
      }
    }
  }

  getPresence(id: string): CursorPresence | undefined {
    return this.presences.get(id);
  }

  getAllPresences(): CursorPresence[] {
    return Array.from(this.presences.values());
  }

  private generateColor(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }
}

export const cursorManager = new CursorManager();

export function joinPresence(options: { workspaceId: string; user?: { name?: string } }): string {
  return cursorManager.join(options);
}

export function updatePresence(id: string, updates: Partial<CursorPresence>): void {
  cursorManager.update(id, updates);
}

