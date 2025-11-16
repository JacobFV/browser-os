# Storage API Implementation Plan

## Overview
Add a storage API that provides persistent key-value storage for applications, similar to localStorage but OS-managed with proper isolation and permissions. Each app gets its own storage namespace.

## Architecture

### 1. Storage Syscalls (`packages/kernel/src/syscalls/storage.ts`)
Create storage syscall handlers:
- `storage.get(key)` - Get value by key, returns unknown | null
- `storage.set(key, value)` - Set value by key, returns void
- `storage.remove(key)` - Remove key, returns void
- `storage.clear()` - Clear all keys for this app, returns void
- `storage.keys()` - Get all keys, returns string[]
- `storage.has(key)` - Check if key exists, returns boolean
- `storage.size()` - Get number of keys, returns number

### 2. Storage Manager
- Create a `StorageManager` class that manages app storage
- Use IndexedDB or localStorage as backend
- Namespace storage by appId: `storage:${appId}:${key}`
- Provide quota management and size limits

### 3. Storage API Class (`packages/proc/src/StorageAPI.ts`)
Create a `StorageAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `get()`, `set()`, `remove()`, `clear()`, `keys()`, `has()`, `size()`
- Handles JSON serialization/deserialization automatically
- Provides type-safe getters with optional type parameter

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `storage: StorageAPI`
- Modify `ProcessManager.spawn()` to create a `StorageAPI` instance and add it to `osApi`

## Implementation Details

### Storage Backend
- Use IndexedDB for persistence (already used by FileSystem)
- Store as: `storage:${appId}:${key}` -> JSON.stringify(value)
- Provide quota limits per app (e.g., 10MB default)
- Track storage usage per app

### Usage Example
```javascript
// In app code
// Set value
await os.storage.set('username', 'john_doe');
await os.storage.set('settings', {
  theme: 'dark',
  fontSize: 14,
  notifications: true
});

// Get value
const username = await os.storage.get('username');
const settings = await os.storage.get('settings');

// Type-safe get (with type assertion)
const settings = await os.storage.get<{theme: string, fontSize: number}>('settings');

// Check if key exists
if (await os.storage.has('username')) {
  const user = await os.storage.get('username');
}

// Get all keys
const keys = await os.storage.keys();
console.log('Stored keys:', keys);

// Get storage size
const size = await os.storage.size();
console.log(`Storage has ${size} keys`);

// Remove key
await os.storage.remove('username');

// Clear all
await os.storage.clear();
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/storage.ts` - Storage syscall handlers
2. `packages/proc/src/StorageAPI.ts` - Storage API class
3. `packages/storage/src/StorageManager.ts` - Storage manager (new package or add to existing)

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Add StorageManager dependency, register syscalls
2. `packages/kernel/package.json` - Add storage package dependency
3. `packages/proc/src/types.ts` - Extend OSAPI interface
4. `packages/proc/src/ProcessManager.ts` - Create StorageAPI instance
5. `packages/proc/src/index.ts` - Export StorageAPI

## Considerations

- **Isolation**: Each app's storage is completely isolated by appId
- **Serialization**: Values are JSON-serialized, so only JSON-serializable types are supported
- **Quota**: 
  - Set per-app quota limits (e.g., 10MB)
  - Track usage and throw errors when quota exceeded
  - Provide `os.storage.getQuota()` and `os.storage.getUsage()` methods
  
- **Performance**: 
  - IndexedDB is async, so all operations are async
  - Consider batching operations for better performance
  - Cache frequently accessed values if needed
  
- **Migration**: When app is updated, storage persists automatically
- **Cleanup**: Consider cleanup when app is uninstalled (or provide manual cleanup)

## Security

- Validate storage keys (prevent injection attacks)
- Enforce quota limits strictly
- Isolate storage by appId (no cross-app access)
- Validate serialized data size
- Prevent storage exhaustion attacks

## Implementation Strategy

1. Create StorageManager using IndexedDB
2. Namespace by appId automatically
3. Provide quota management
4. Integrate with permission system if needed
5. Handle serialization/deserialization transparently

