import type { FileMetadata } from '@browser-os/schemas';

/**
 * Base interface for all filesystem backends
 */
export interface Backend {
  /**
   * Read file contents
   */
  read(path: string): Promise<Uint8Array>;

  /**
   * Write file contents
   */
  write(path: string, data: Uint8Array): Promise<void>;

  /**
   * Delete a file
   */
  delete(path: string): Promise<void>;

  /**
   * Check if a path exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Create a directory
   */
  mkdir(path: string): Promise<void>;

  /**
   * Remove a directory
   */
  rmdir(path: string): Promise<void>;

  /**
   * List directory contents
   */
  readdir(path: string): Promise<string[]>;

  /**
   * Get file metadata
   */
  stat(path: string): Promise<FileMetadata>;

  /**
   * Initialize the backend
   */
  init?(): Promise<void>;
}

