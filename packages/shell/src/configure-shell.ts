import { OS } from '@browser-os/app-sdk';
import { DesktopIcon } from '@browser-os/desktop';
import { ThemeSkin, applyTheme } from '@browser-os/theme';
import { initFilesystem, FilesystemInitOptions } from '@browser-os/fs';
import { DesktopShellState } from './state';

export interface ShellConfig {
  vfs?: FilesystemInitOptions;
  desktop?: {
    icons?: DesktopIcon[];
    wallpaper?: string;
  };
  theme?: {
    skin?: ThemeSkin;
    accent?: string;
  };
}

/**
 * Configure shell UI and settings
 * 
 * Sets up theme, desktop icons, wallpaper, and filesystem.
 * This is separate from OS creation to allow for customization.
 * 
 * @param os - OS instance
 * @param config - Shell configuration options
 * @returns Partial shell state with configured values
 */
export function configureShell(os: OS, config?: ShellConfig): Partial<DesktopShellState> {
  // Initialize filesystem using OS VFS instance
  initFilesystem(os.getVFS(), config?.vfs);
  
  // Initialize theme
  const themeSkin = config?.theme?.skin || 'win95';
  const themeAccent = config?.theme?.accent;
  applyTheme(themeSkin, themeAccent);
  
  // Get desktop icons
  const desktopIcons = config?.desktop?.icons || [];
  
  return {
    vfs: os.getVFS(),
    desktopIcons,
    initialTheme: themeSkin,
    wallpaper: config?.desktop?.wallpaper,
  };
}

