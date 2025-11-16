/**
 * Clipboard API for processes to read/write clipboard data
 */

export interface ClipboardData {
  type: 'text' | 'image' | 'file';
  data: string | Uint8Array;
  mimeType?: string;
}

/**
 * Clipboard API factory
 */
export class ClipboardAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Read text from clipboard
   */
  async readText(): Promise<string> {
    return (await this.syscall('clipboard.readText', {})) as string;
  }

  /**
   * Write text to clipboard
   */
  async writeText(text: string): Promise<void> {
    await this.syscall('clipboard.writeText', { text });
  }

  /**
   * Read clipboard data (any type)
   */
  async read(): Promise<ClipboardData | null> {
    const result = await this.syscall('clipboard.read', {});
    if (!result) {
      return null;
    }

    const data = result as {
      type: 'text' | 'image' | 'file';
      data: string | number[];
      mimeType?: string;
    };

    // Convert array back to Uint8Array for image type
    if (data.type === 'image' && Array.isArray(data.data)) {
      return {
        type: 'image',
        data: new Uint8Array(data.data),
        mimeType: data.mimeType,
      };
    }

    return data as ClipboardData;
  }

  /**
   * Write clipboard data (any type)
   */
  async write(data: ClipboardData): Promise<void> {
    // Convert Uint8Array to array for serialization
    const serializableData = {
      type: data.type,
      data: data.type === 'image' && data.data instanceof Uint8Array
        ? Array.from(data.data)
        : data.data,
      mimeType: data.mimeType,
    };

    await this.syscall('clipboard.write', { data: serializableData });
  }

  /**
   * Clear clipboard
   */
  async clear(): Promise<void> {
    await this.syscall('clipboard.clear', {});
  }

  /**
   * Check if clipboard has text
   */
  async hasText(): Promise<boolean> {
    return (await this.syscall('clipboard.hasText', {})) as boolean;
  }

  /**
   * Check if clipboard has image
   */
  async hasImage(): Promise<boolean> {
    return (await this.syscall('clipboard.hasImage', {})) as boolean;
  }
}

