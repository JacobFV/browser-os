import type { EventBus } from '@browser-os/events';

export interface ClipboardManagerOptions {
  eventBus?: EventBus;
}

export interface ClipboardData {
  type: 'text' | 'image' | 'file';
  data: string | Uint8Array;
  mimeType?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  data: Uint8Array;
}

/**
 * Clipboard Manager for clipboard operations
 */
export class ClipboardManager {
  private eventBus?: EventBus;

  constructor(options?: ClipboardManagerOptions) {
    this.eventBus = options?.eventBus;
  }

  /**
   * Read text from clipboard
   */
  async readText(): Promise<string> {
    if (navigator.clipboard && navigator.clipboard.readText) {
      try {
        return await navigator.clipboard.readText();
      } catch (error) {
        // Fallback to execCommand if clipboard API fails
        return this.readTextFallback();
      }
    }
    return this.readTextFallback();
  }

  /**
   * Write text to clipboard
   */
  async writeText(text: string): Promise<void> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (error) {
        // Fallback to execCommand if clipboard API fails
        return this.writeTextFallback(text);
      }
    }
    return this.writeTextFallback(text);
  }

  /**
   * Read clipboard data (any type)
   */
  async read(): Promise<ClipboardData | null> {
    // Try to read as text first
    try {
      const text = await this.readText();
      if (text) {
        return {
          type: 'text',
          data: text,
        };
      }
    } catch {
      // Ignore
    }

    // Try to read as image
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          if (item.types.includes('image/png')) {
            const blob = await item.getType('image/png');
            const arrayBuffer = await blob.arrayBuffer();
            return {
              type: 'image',
              data: new Uint8Array(arrayBuffer),
              mimeType: 'image/png',
            };
          }
        }
      }
    } catch {
      // Ignore
    }

    return null;
  }

  /**
   * Write clipboard data (any type)
   */
  async write(data: ClipboardData): Promise<void> {
    if (data.type === 'text') {
      await this.writeText(data.data as string);
    } else if (data.type === 'image' && navigator.clipboard && navigator.clipboard.write) {
      const uint8Array = data.data as Uint8Array;
      // Create a new ArrayBuffer to avoid type issues
      const buffer = new ArrayBuffer(uint8Array.length);
      new Uint8Array(buffer).set(uint8Array);
      const blob = new Blob([buffer], { type: data.mimeType ?? 'image/png' });
      const clipboardItem = new ClipboardItem({ [data.mimeType ?? 'image/png']: blob });
      await navigator.clipboard.write([clipboardItem]);
    } else {
      throw new Error(`Unsupported clipboard type: ${data.type}`);
    }
  }

  /**
   * Clear clipboard
   */
  async clear(): Promise<void> {
    // Write empty string to clear
    await this.writeText('');
  }

  /**
   * Check if clipboard has text
   */
  async hasText(): Promise<boolean> {
    try {
      const text = await this.readText();
      return text.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Check if clipboard has image
   */
  async hasImage(): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        return items.some((item) => item.types.some((type) => type.startsWith('image/')));
      }
    } catch {
      // Ignore
    }
    return false;
  }

  /**
   * Fallback for reading text (uses execCommand)
   */
  private readTextFallback(): string {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();

    try {
      document.execCommand('paste');
      const text = textarea.value;
      document.body.removeChild(textarea);
      return text;
    } catch {
      document.body.removeChild(textarea);
      return '';
    }
  }

  /**
   * Fallback for writing text (uses execCommand)
   */
  private writeTextFallback(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (success) {
          resolve();
        } else {
          reject(new Error('Failed to copy to clipboard'));
        }
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
      }
    });
  }
}

