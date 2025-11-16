import type { PrintManager } from '@browser-os/print';
import type { SyscallHandler } from '../types';

export function createPrintSyscalls(printManager: PrintManager): Record<string, SyscallHandler> {
  return {
    'print.html': async (args) => {
      const html = args.html as string;
      const options = args.options as {
        silent?: boolean;
        printBackground?: boolean;
        margin?: {
          top?: string;
          bottom?: string;
          left?: string;
          right?: string;
        };
        scale?: number;
        pageRanges?: Array<{ from: number; to: number }>;
        headerFooter?: boolean;
      } | undefined;

      if (!html) {
        throw new Error('html required');
      }

      await printManager.printHTML(html, options);
      return null;
    },

    'print.window': async (args) => {
      const options = args.options as {
        silent?: boolean;
        printBackground?: boolean;
        margin?: {
          top?: string;
          bottom?: string;
          left?: string;
          right?: string;
        };
        scale?: number;
        pageRanges?: Array<{ from: number; to: number }>;
        headerFooter?: boolean;
      } | undefined;

      await printManager.printWindow(options);
      return null;
    },

    'print.url': async (args) => {
      const url = args.url as string;
      const options = args.options as {
        silent?: boolean;
        printBackground?: boolean;
        margin?: {
          top?: string;
          bottom?: string;
          left?: string;
          right?: string;
        };
        scale?: number;
        pageRanges?: Array<{ from: number; to: number }>;
        headerFooter?: boolean;
      } | undefined;

      if (!url) {
        throw new Error('url required');
      }

      await printManager.printURL(url, options);
      return null;
    },
  };
}

