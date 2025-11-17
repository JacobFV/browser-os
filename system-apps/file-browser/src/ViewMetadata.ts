import type { FileSystem } from '@browser-os/fs';

export interface ViewMetadata {
  viewMode?: 'list' | 'details' | 'tile';
  itemScale?: number;
  sortField?: 'name' | 'size' | 'modified' | 'type';
  sortDirection?: 'asc' | 'desc';
  itemPositions?: Record<string, { x: number; y: number }>;
}

const VIEW_METADATA_FILENAME = '.view.json';

/**
 * Get the path to the .view.json file for a directory
 */
function getViewMetadataPath(dirPath: string): string {
  if (dirPath === '/') {
    return `/${VIEW_METADATA_FILENAME}`;
  }
  return `${dirPath}/${VIEW_METADATA_FILENAME}`;
}

/**
 * Load view metadata for a directory
 */
export async function loadViewMetadata(fs: FileSystem, dirPath: string): Promise<ViewMetadata | null> {
  try {
    const metadataPath = getViewMetadataPath(dirPath);
    if (!(await fs.exists(metadataPath))) {
      return null;
    }

    const data = await fs.read(metadataPath);
    const text = new TextDecoder().decode(data);
    return JSON.parse(text) as ViewMetadata;
  } catch (error) {
    console.error('[ViewMetadata] Failed to load view metadata:', error);
    return null;
  }
}

/**
 * Save view metadata for a directory
 */
export async function saveViewMetadata(
  fs: FileSystem,
  dirPath: string,
  metadata: ViewMetadata
): Promise<void> {
  try {
    const metadataPath = getViewMetadataPath(dirPath);
    const text = JSON.stringify(metadata, null, 2);
    const data = new TextEncoder().encode(text);
    await fs.write(metadataPath, data);
  } catch (error) {
    console.error('[ViewMetadata] Failed to save view metadata:', error);
    throw error;
  }
}

/**
 * Check if a filename should be hidden from directory listings
 */
export function isHiddenMetadataFile(filename: string): boolean {
  return filename === VIEW_METADATA_FILENAME;
}

