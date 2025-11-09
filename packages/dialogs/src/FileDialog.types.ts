export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface FileDialogOptions {
  mode: 'open' | 'save';
  title?: string;
  filters?: FileFilter[];
  defaultPath?: string;
  allowMultiple?: boolean; // open only
}

export interface FileDialogResult {
  canceled: boolean;
  filePaths: string[];
}

