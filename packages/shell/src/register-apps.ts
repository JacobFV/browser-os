import { OS, App, AppMetadata } from '@browser-os/app-sdk';

/**
 * Get all system app metadata definitions
 * This function returns metadata for apps that will be stored in VFS
 */
function getSystemAppMetadata(): AppMetadata[] {
  return [
    {
      id: 'terminal',
      modulePath: '@system-apps/terminal',
      className: 'TerminalApp',
    },
    {
      id: 'calculator',
      modulePath: '@system-apps/calculator',
      className: 'CalculatorApp',
    },
    {
      id: 'files',
      modulePath: '@system-apps/files',
      className: 'FilesApp',
    },
    {
      id: 'notes',
      modulePath: '@system-apps/notes',
      className: 'NotesApp',
    },
    {
      id: 'monitor',
      modulePath: '@system-apps/monitor',
      className: 'MonitorApp',
    },
    {
      id: 'settings',
      modulePath: '@system-apps/settings',
      className: 'SettingsApp',
    },
    {
      id: 'editor',
      modulePath: '@system-apps/editor',
      className: 'EditorApp',
    },
    {
      id: 'browser',
      modulePath: '@system-apps/browser',
      className: 'BrowserApp',
    },
    {
      id: 'calendar',
      modulePath: '@system-apps/calendar',
      className: 'CalendarApp',
    },
    {
      id: 'store',
      modulePath: '@system-apps/store',
      className: 'StoreApp',
    },
    {
      id: 'os.word-processor',
      modulePath: '@system-apps/word-processor',
      className: 'WordProcessorApp',
    },
  ];
}

/**
 * Register system apps with the OS using VFS-based app registry
 * 
 * This function:
 * 1. Writes app metadata files to VFS at vfs://bin/
 * 2. Loads apps from VFS using OS.loadAppFromVFS()
 * 
 * This decouples the shell from system apps - apps are stored in VFS
 * and loaded dynamically by the kernel (OS) using PATH resolution.
 * 
 * @param os - OS instance to register apps with
 * @returns Array of registered app instances
 */
export async function registerSystemApps(os: OS): Promise<App[]> {
  const metadataList = getSystemAppMetadata();
  const registeredApps: App[] = [];
  
  // Step 1: Write all app metadata to VFS
  for (const metadata of metadataList) {
    await os.registerAppToVFS(metadata);
  }
  
  // Step 2: Load all apps from VFS
  for (const metadata of metadataList) {
    const app = await os.loadAppFromVFS(metadata.id);
    registeredApps.push(app);
  }
  
  return registeredApps;
}

