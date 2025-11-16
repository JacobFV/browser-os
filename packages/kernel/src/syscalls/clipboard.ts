import type { ClipboardManager } from '@browser-os/clipboard';
import type { SyscallHandler } from '../types';

export function createClipboardSyscalls(
  clipboardManager: ClipboardManager
): Record<string, SyscallHandler> {
  return {
    'clipboard.readText': async () => {
      const text = await clipboardManager.readText();
      return text;
    },

    'clipboard.writeText': async (args) => {
      const text = args.text as string;
      if (typeof text !== 'string') {
        throw new Error('text must be a string');
      }
      await clipboardManager.writeText(text);
      return null;
    },

    'clipboard.read': async () => {
      const data = await clipboardManager.read();
      if (!data) {
        return null;
      }

      // Serialize data for return
      if (data.type === 'text') {
        return {
          type: 'text',
          data: data.data,
        };
      } else if (data.type === 'image') {
        // Convert Uint8Array to array for JSON serialization
        return {
          type: 'image',
          data: Array.from(data.data as Uint8Array),
          mimeType: data.mimeType,
        };
      }

      return null;
    },

    'clipboard.write': async (args) => {
      const data = args.data as {
        type: 'text' | 'image' | 'file';
        data: string | number[];
        mimeType?: string;
      };

      if (!data || !data.type) {
        throw new Error('data.type required');
      }

      if (data.type === 'text') {
        if (typeof data.data !== 'string') {
          throw new Error('data.data must be a string for text type');
        }
        await clipboardManager.write({
          type: 'text',
          data: data.data,
        });
      } else if (data.type === 'image') {
        if (!Array.isArray(data.data)) {
          throw new Error('data.data must be an array for image type');
        }
        await clipboardManager.write({
          type: 'image',
          data: new Uint8Array(data.data),
          mimeType: data.mimeType,
        });
      } else {
        throw new Error(`Unsupported clipboard type: ${data.type}`);
      }

      return null;
    },

    'clipboard.clear': async () => {
      await clipboardManager.clear();
      return null;
    },

    'clipboard.hasText': async () => {
      return await clipboardManager.hasText();
    },

    'clipboard.hasImage': async () => {
      return await clipboardManager.hasImage();
    },
  };
}

