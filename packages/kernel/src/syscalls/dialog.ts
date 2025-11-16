import type { DialogManager } from '@browser-os/dialogs';
import type { SyscallHandler } from '../types';

export function createDialogSyscalls(dialogManager: DialogManager): Record<string, SyscallHandler> {
  return {
    'dialog.alert': async (args) => {
      const message = args.message as string;
      const options = args.options as {
        title?: string;
        icon?: 'info' | 'warning' | 'error' | 'success';
      } | undefined;

      if (!message) {
        throw new Error('message required');
      }

      await dialogManager.alert(message, options);
      return null;
    },

    'dialog.confirm': async (args) => {
      const message = args.message as string;
      const options = args.options as {
        title?: string;
        icon?: 'info' | 'warning' | 'error' | 'success';
        confirmLabel?: string;
        cancelLabel?: string;
      } | undefined;

      if (!message) {
        throw new Error('message required');
      }

      const result = await dialogManager.confirm(message, options);
      return result;
    },

    'dialog.prompt': async (args) => {
      const message = args.message as string;
      const defaultValue = args.defaultValue as string | undefined;
      const options = args.options as {
        title?: string;
        icon?: 'info' | 'warning' | 'error' | 'success';
        placeholder?: string;
        inputType?: 'text' | 'password' | 'number';
        confirmLabel?: string;
        cancelLabel?: string;
      } | undefined;

      if (!message) {
        throw new Error('message required');
      }

      const result = await dialogManager.prompt(message, defaultValue, options);
      return result;
    },

    'dialog.openFile': async (args) => {
      const options = args.options as {
        title?: string;
        defaultPath?: string;
        filters?: Array<{
          name: string;
          extensions: string[];
        }>;
        multiple?: boolean;
      } | undefined;

      const result = await dialogManager.openFile(options);
      return result;
    },

    'dialog.saveFile': async (args) => {
      const options = args.options as {
        title?: string;
        defaultPath?: string;
        filters?: Array<{
          name: string;
          extensions: string[];
        }>;
        createDirectory?: boolean;
      } | undefined;

      const result = await dialogManager.saveFile(options);
      return result;
    },

    'dialog.selectDirectory': async (args) => {
      const options = args.options as {
        title?: string;
        defaultPath?: string;
      } | undefined;

      const result = await dialogManager.selectDirectory(options);
      return result;
    },
  };
}

