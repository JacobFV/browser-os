/**
 * Node.js entry point - excludes browser-specific backends
 * Use this for testing and Node.js environments
 */
export * from './FileSystem';
export * from './MountManager';
export * from './backends/BaseBackend';
export * from './backends/EphemeralBackend';
export * from './PathUtils';

// Note: IndexedDBBackend, LocalStorageBackend, and ServerBackend
// are browser-specific and excluded from this entry point

