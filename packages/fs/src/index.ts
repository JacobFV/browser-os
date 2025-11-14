// Main entry point - exports everything including browser-specific backends
// For Node.js/testing, use './node' entry point instead
export * from './FileSystem';
export * from './MountManager';
export * from './backends/BaseBackend';
export * from './backends/LocalStorageBackend';
export * from './backends/IndexedDBBackend';
export * from './backends/ServerBackend';
export * from './backends/EphemeralBackend';
export * from './PathUtils';

