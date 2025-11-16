# Workspace API Implementation Plan

## Overview
Add a workspace API that allows application processes to query and manage workspaces. Windows are workspace-scoped, so apps need to know which workspace they're in and be able to switch workspaces.

## Architecture

### 1. Workspace Syscalls (`packages/kernel/src/syscalls/workspace.ts`)
Create workspace syscall handlers:
- `workspace.getCurrent()` - Get current workspace ID, returns string
- `workspace.list()` - List all workspaces, returns WorkspaceInfo[]
- `workspace.get(id)` - Get workspace info, returns WorkspaceInfo
- `workspace.create(name)` - Create new workspace, returns WorkspaceInfo
- `workspace.switch(id)` - Switch to workspace, returns void
- `workspace.delete(id)` - Delete workspace (if empty), returns void
- `workspace.rename(id, name)` - Rename workspace, returns void

### 2. Workspace Manager Integration
- WorkspaceManager already exists in the system
- Need to expose its functionality via syscalls
- Processes should only be able to query workspaces, not necessarily create/delete (permission-based)

### 3. Workspace API Class (`packages/proc/src/WorkspaceAPI.ts`)
Create a `WorkspaceAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `getCurrent()`, `list()`, `get()`, `create()`, `switch()`, `delete()`, `rename()`
- Returns `Workspace` objects with properties: `id`, `name`, `windowCount`, `isActive`

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `workspace: WorkspaceAPI`
- Modify `ProcessManager.spawn()` to create a `WorkspaceAPI` instance and add it to `osApi`

## Implementation Details

### Workspace Info
```typescript
interface WorkspaceInfo {
  id: string;
  name: string;
  windowCount: number;
  isActive: boolean;
  createdAt?: number;
}
```

### Usage Example
```javascript
// In app code
// Get current workspace
const current = await os.workspace.getCurrent();
console.log('Current workspace:', current);

// List all workspaces
const workspaces = await os.workspace.list();
workspaces.forEach(ws => {
  console.log(`${ws.name} (${ws.windowCount} windows)`);
});

// Get workspace info
const workspace = await os.workspace.get(current);
console.log('Workspace name:', workspace.name);

// Create new workspace
const newWorkspace = await os.workspace.create('Development');
console.log('Created workspace:', newWorkspace.id);

// Switch workspace
await os.workspace.switch(newWorkspace.id);

// Rename workspace
await os.workspace.rename(newWorkspace.id, 'Production');

// Delete workspace (if empty)
await os.workspace.delete(newWorkspace.id);
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/workspace.ts` - Workspace syscall handlers
2. `packages/proc/src/WorkspaceAPI.ts` - Workspace API class

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Add WorkspaceManager dependency, register syscalls
2. `packages/kernel/package.json` - Add `@browser-os/workspace` dependency
3. `packages/proc/src/types.ts` - Extend OSAPI interface
4. `packages/proc/src/ProcessManager.ts` - Create WorkspaceAPI instance
5. `packages/proc/src/index.ts` - Export WorkspaceAPI

## Considerations

- **Window Association**: When creating windows, apps need to specify workspaceId. The current workspace should be available via `os.workspace.getCurrent()`

- **Permissions**: 
  - All processes should be able to query workspaces (getCurrent, list, get)
  - Creating/deleting/renaming workspaces might require special permissions
  - Switching workspaces might be restricted or require user confirmation

- **Workspace Context**: Processes should know which workspace they're running in. This could be:
  - Passed via environment variable
  - Queried via syscall
  - Stored in process metadata

- **Window Migration**: When switching workspaces, should windows move with the process? Or stay in original workspace?

- **Event Integration**: Workspace changes should emit events that processes can listen to via `os.channel`

## Security

- Validate workspace IDs
- Prevent workspace deletion if it has windows (unless force flag)
- Limit workspace creation (prevent spam)
- Check permissions for workspace modification operations

## Implementation Strategy

1. Expose WorkspaceManager methods via syscalls
2. Add permission checks for modification operations
3. Provide read-only access by default
4. Integrate with window creation to use current workspace

