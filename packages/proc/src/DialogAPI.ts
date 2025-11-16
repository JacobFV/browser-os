/**
 * Dialog API for processes to show system dialogs
 */

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
 * Dialog API factory
 */
export class DialogAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Show alert dialog
   */
  async alert(message: string, options?: AlertOptions): Promise<void> {
    await this.syscall('dialog.alert', { message, options });
  }

  /**
   * Show confirm dialog
   */
  async confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
    return (await this.syscall('dialog.confirm', { message, options })) as boolean;
  }

  /**
   * Show prompt dialog
   */
  async prompt(message: string, defaultValue?: string, options?: PromptOptions): Promise<string | null> {
    return (await this.syscall('dialog.prompt', { message, defaultValue, options })) as string | null;
  }

  /**
   * Show file open dialog
   */
  async openFile(options?: FileDialogOptions): Promise<FileInfo[] | null> {
    return (await this.syscall('dialog.openFile', { options })) as FileInfo[] | null;
  }

  /**
   * Show file save dialog
   */
  async saveFile(options?: FileDialogOptions): Promise<FileInfo | null> {
    return (await this.syscall('dialog.saveFile', { options })) as FileInfo | null;
  }

  /**
   * Show directory picker dialog
   */
  async selectDirectory(options?: DirectoryDialogOptions): Promise<string | null> {
    return (await this.syscall('dialog.selectDirectory', { options })) as string | null;
  }
}

