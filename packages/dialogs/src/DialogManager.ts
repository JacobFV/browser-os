import type { EventBus } from '@browser-os/events';
import type { FileSystem } from '@browser-os/fs';

export interface DialogManagerOptions {
  eventBus: EventBus;
  fs?: FileSystem;
}

export interface AlertOptions {
  title?: string;
  icon?: 'info' | 'warning' | 'error' | 'success';
}

export interface ConfirmOptions extends AlertOptions {
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface PromptOptions extends AlertOptions {
  placeholder?: string;
  inputType?: 'text' | 'password' | 'number';
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface FileDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  multiple?: boolean;
  createDirectory?: boolean;
}

export interface DirectoryDialogOptions {
  title?: string;
  defaultPath?: string;
}

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  isDirectory: boolean;
  lastModified: number;
}

/**
 * Dialog Manager for programmatic dialog display
 */
export class DialogManager {
  private eventBus: EventBus;
  private fs?: FileSystem;
  private pendingDialogs: Map<string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = new Map();

  constructor(options: DialogManagerOptions) {
    this.eventBus = options.eventBus;
    this.fs = options.fs;

    // Listen for dialog responses
    this.eventBus.on('dialog:response', (event) => {
      const { dialogId, result, error } = event.payload as {
        dialogId: string;
        result?: unknown;
        error?: string;
      };

      const pending = this.pendingDialogs.get(dialogId);
      if (pending) {
        this.pendingDialogs.delete(dialogId);
        if (error) {
          pending.reject(new Error(error));
        } else {
          pending.resolve(result);
        }
      }
    });
  }

  /**
   * Show alert dialog (uses native browser alert)
   */
  async alert(message: string, options?: AlertOptions): Promise<void> {
    // Use native browser alert for simplicity
    window.alert(message);
    return Promise.resolve();
  }

  /**
   * Show confirm dialog (uses native browser confirm)
   */
  async confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
    // Use native browser confirm for simplicity
    return window.confirm(message);
  }

  /**
   * Show prompt dialog (uses native browser prompt)
   */
  async prompt(message: string, defaultValue?: string, options?: PromptOptions): Promise<string | null> {
    // Use native browser prompt for simplicity
    const result = window.prompt(message, defaultValue ?? '');
    return result;
  }

  /**
   * Show file open dialog (requires OS layer rendering)
   */
  async openFile(options?: FileDialogOptions): Promise<FileInfo[] | null> {
    const dialogId = `dialog-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    return new Promise<FileInfo[] | null>((resolve, reject) => {
      this.pendingDialogs.set(dialogId, { resolve, reject });

      // Request dialog from OS layer
      this.eventBus.emit('dialog:open-file:request', {
        dialogId,
        options: options ?? {},
      }, { source: 'dialog-manager' });

      // Timeout after 5 minutes
      setTimeout(() => {
        if (this.pendingDialogs.has(dialogId)) {
          this.pendingDialogs.delete(dialogId);
          reject(new Error('Dialog timeout'));
        }
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Show file save dialog (requires OS layer rendering)
   */
  async saveFile(options?: FileDialogOptions): Promise<FileInfo | null> {
    const dialogId = `dialog-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    return new Promise<FileInfo | null>((resolve, reject) => {
      this.pendingDialogs.set(dialogId, { resolve, reject });

      // Request dialog from OS layer
      this.eventBus.emit('dialog:save-file:request', {
        dialogId,
        options: options ?? {},
      }, { source: 'dialog-manager' });

      // Timeout after 5 minutes
      setTimeout(() => {
        if (this.pendingDialogs.has(dialogId)) {
          this.pendingDialogs.delete(dialogId);
          reject(new Error('Dialog timeout'));
        }
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Show directory picker dialog (requires OS layer rendering)
   */
  async selectDirectory(options?: DirectoryDialogOptions): Promise<string | null> {
    const dialogId = `dialog-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    return new Promise<string | null>((resolve, reject) => {
      this.pendingDialogs.set(dialogId, { resolve, reject });

      // Request dialog from OS layer
      this.eventBus.emit('dialog:select-directory:request', {
        dialogId,
        options: options ?? {},
      }, { source: 'dialog-manager' });

      // Timeout after 5 minutes
      setTimeout(() => {
        if (this.pendingDialogs.has(dialogId)) {
          this.pendingDialogs.delete(dialogId);
          reject(new Error('Dialog timeout'));
        }
      }, 5 * 60 * 1000);
    });
  }
}

