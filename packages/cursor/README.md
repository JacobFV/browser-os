# @browser-os/cursor

Cursor and presence system for browser-os with optional multi-user support.

## Installation

```bash
pnpm add @browser-os/cursor
```

## Features

- **Local Cursor**: Render local cursor position
- **Presence System**: Track user presence
- **Multi-User**: Optional Yjs integration for real-time collaboration
- **Agent Detection**: Flag bots/agents

## Usage

### Joining Presence

```typescript
import { joinPresence, updatePresence, cursorManager } from '@browser-os/cursor';

// Join workspace
const presenceId = joinPresence({
  workspaceId: 'workspace-1',
  user: { name: 'John Doe' },
});

// Update cursor position
updatePresence(presenceId, {
  pos: { x: 100, y: 200 },
  winId: 'win-123',
});
```

### Getting Presences

```typescript
import { cursorManager } from '@browser-os/cursor';

// Get all presences
const presences = cursorManager.getAllPresences();

presences.forEach(presence => {
  console.log(`${presence.name}:`, presence.pos);
});
```

## CursorPresence Interface

```typescript
interface CursorPresence {
  id: string;
  name?: string;
  color: string;              // Auto-generated color
  pos?: { x: number; y: number };
  winId?: string;             // Current window
  selection?: any;            // App-specific selection
  agent?: boolean;            // Is this a bot?
}
```

## Color Generation

Cursor colors are deterministically generated from user ID:

```typescript
// Same ID = same color
const color1 = cursorManager.join({ workspaceId: 'ws-1', user: { name: 'User' } });
const color2 = cursorManager.join({ workspaceId: 'ws-1', user: { name: 'User' } });
// color1 === color2
```

## Multi-User (Yjs Integration)

Optional Yjs integration for real-time collaboration:

```typescript
import { YjsPresenceProvider } from '@browser-os/cursor';

// Setup Yjs provider
const provider = new YjsPresenceProvider('workspace-1');

// Presence updates sync automatically
updatePresence(presenceId, { pos: { x: 100, y: 200 } });
// Other users see the update in real-time
```

## Events

Cursor events are emitted via event bus:

```typescript
import { eventBus } from '@browser-os/core';

eventBus.on('cursor', (event) => {
  switch (event.type) {
    case 'move':
      console.log('Cursor moved:', event.id, event.x, event.y);
      break;
    case 'enter':
      console.log('Cursor entered:', event.id);
      break;
    case 'leave':
      console.log('Cursor left:', event.id);
      break;
  }
});
```

## Rendering Cursors

Render cursors in your app:

```typescript
import { cursorManager } from '@browser-os/cursor';

function CursorOverlay() {
  const presences = cursorManager.getAllPresences();
  
  return (
    <div className="cursor-overlay">
      {presences.map(presence => (
        <div
          key={presence.id}
          className="cursor"
          style={{
            left: presence.pos?.x,
            top: presence.pos?.y,
            color: presence.color,
          }}
        >
          {presence.name}
        </div>
      ))}
    </div>
  );
}
```

## Agent Detection

Flag bots/agents:

```typescript
updatePresence(presenceId, {
  agent: true,
  name: 'AI Assistant',
});
```

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

