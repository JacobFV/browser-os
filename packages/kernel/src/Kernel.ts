import { EventBus } from '@browser-os/events';
import { FileSystem, EphemeralBackend } from '@browser-os/fs';
import { ProcessManager } from '@browser-os/proc';
import { AppRegistry } from '@browser-os/app-registry';
import { PermissionManager } from './PermissionManager';
import { SyscallRouter } from './SyscallRouter';
import { createFSSyscalls } from './syscalls/fs';
import { createProcSyscalls } from './syscalls/proc';
import { createRegistrySyscalls } from './syscalls/registry';
import type { SystemConfig } from '@browser-os/schemas';
import { SystemConfigSchema } from '@browser-os/schemas';

const CONFIG_PATH = '/etc/config.json';
const MOUNTS_PATH = '/etc/mounts.json';

export interface KernelOptions {
  eventBus?: EventBus;
}

/**
 * Main kernel - orchestrates all modules
 */
export class Kernel {
  private eventBus: EventBus;
  private fs: FileSystem;
  private procManager: ProcessManager;
  private appRegistry: AppRegistry;
  private permissionManager: PermissionManager;
  private syscallRouter: SyscallRouter;
  private initialized: boolean = false;

  constructor(options?: KernelOptions) {
    this.eventBus = options?.eventBus ?? new EventBus();
    this.fs = new FileSystem({ eventBus: this.eventBus });
    this.permissionManager = new PermissionManager();
    this.syscallRouter = new SyscallRouter(this.permissionManager);
    this.procManager = new ProcessManager({
      eventBus: this.eventBus,
      fs: this.fs,
      syscallHandler: async (pid, syscall, args) => {
        const response = await this.syscallRouter.handle({
          id: crypto.randomUUID(),
          syscall,
          args,
          pid,
        });
        if (!response.success) {
          throw new Error(response.error ?? 'Syscall failed');
        }
        return response.data;
      },
    });
    this.appRegistry = new AppRegistry({
      fs: this.fs,
      eventBus: this.eventBus,
    });
  }

  /**
   * Initialize kernel and all modules
   */
  async init(options?: { skipFilesystem?: boolean }): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize filesystem (unless skipped for testing)
    if (!options?.skipFilesystem) {
      await this.initFilesystem();
    }

    // Load system configuration
    const config = await this.loadConfig();

    // Initialize app registry
    await this.appRegistry.load();

    // Register syscall handlers
    this.registerSyscalls();

    // Set up default permissions for system processes
    this.setupDefaultPermissions(config);

    this.initialized = true;
    this.eventBus.emit('kernel:ready', {}, { source: 'kernel' });
  }

  /**
   * Initialize filesystem with default structure
   */
  private async initFilesystem(): Promise<void> {
    // Mount root filesystem (IndexedDB) - use dynamic import to avoid loading in Node.js
    const { IndexedDBBackend } = await import('@browser-os/fs');
    const rootBackend = new IndexedDBBackend({ dbName: 'browser-os-fs' });
    await rootBackend.init();
    await this.fs.mount('/', rootBackend);

    // Mount tmp (ephemeral)
    const tmpBackend = new EphemeralBackend();
    await this.fs.mount('/tmp', tmpBackend);

    // Create default directory structure
    await this.createDefaultStructure();

    // Load mount configuration if it exists
    await this.loadMounts();
  }

  /**
   * Create default directory structure
   */
  private async createDefaultStructure(): Promise<void> {
    const dirs = [
      '/bin',
      '/etc',
      '/home',
      '/home/user',
      '/home/user/Documents',
      '/home/user/Downloads',
      '/home/user/Videos',
      '/home/user/Pictures',
      '/home/user/Music',
      '/home/user/Desktop',
      '/home/user/.config',
      '/tmp',
      '/var',
      '/var/log',
      '/var/cache',
      '/sys',
    ];

    for (const dir of dirs) {
      try {
        await this.fs.mkdir(dir, { recursive: true });
      } catch {
        // Directory might already exist
      }
    }
  }

  /**
   * Load mount configuration
   */
  private async loadMounts(): Promise<void> {
    try {
      const exists = await this.fs.exists(MOUNTS_PATH);
      if (!exists) {
        // Create default mounts config
        const defaultMounts = [
          { path: '/', backend: 'indexedDB', options: { dbName: 'browser-os-fs' } },
          { path: '/tmp', backend: 'ephemeral', options: {} },
        ];
        const data = new TextEncoder().encode(JSON.stringify(defaultMounts, null, 2));
        await this.fs.write(MOUNTS_PATH, data);
        return;
      }

      // TODO: Load and apply mounts from config
      // For now, we use the defaults set in initFilesystem
    } catch (error) {
      console.warn('Failed to load mounts config:', error);
    }
  }

  /**
   * Load system configuration
   */
  private async loadConfig(): Promise<SystemConfig> {
    try {
      const exists = await this.fs.exists(CONFIG_PATH);
      if (!exists) {
        // Create default config
        const defaultConfig: SystemConfig = {
          users: [
            {
              id: 'user-1',
              username: 'user',
              homeDir: '/home/user',
            },
          ],
          defaultUser: 'user-1',
          mounts: [],
          system: {
            hostname: 'browser-os',
          },
        };
        const data = new TextEncoder().encode(JSON.stringify(defaultConfig, null, 2));
        await this.fs.write(CONFIG_PATH, data);
        return defaultConfig;
      }

      const data = await this.fs.read(CONFIG_PATH);
      const json = new TextDecoder().decode(data);
      return SystemConfigSchema.parse(JSON.parse(json));
    } catch (error) {
      console.error('Failed to load config:', error);
      // Return default config on error
      return {
        users: [
          {
            id: 'user-1',
            username: 'user',
            homeDir: '/home/user',
          },
        ],
        defaultUser: 'user-1',
        mounts: [],
        system: {
          hostname: 'browser-os',
        },
      };
    }
  }

  /**
   * Register all syscall handlers
   */
  private registerSyscalls(): void {
    // Register FS syscalls
    const fsSyscalls = createFSSyscalls(this.fs);
    for (const [name, handler] of Object.entries(fsSyscalls)) {
      this.syscallRouter.register(name, handler);
    }

    // Register proc syscalls
    const procSyscalls = createProcSyscalls(this.procManager);
    for (const [name, handler] of Object.entries(procSyscalls)) {
      this.syscallRouter.register(name, handler);
    }

    // Register registry syscalls
    const registrySyscalls = createRegistrySyscalls(this.appRegistry);
    for (const [name, handler] of Object.entries(registrySyscalls)) {
      this.syscallRouter.register(name, handler);
    }
  }

  /**
   * Set up default permissions
   */
  private setupDefaultPermissions(config: SystemConfig): void {
    // Default permissions for user processes
    const defaultUserPermissions = {
      pid: 0, // Will be set per process
      allowedSyscalls: [
        'fs.read',
        'fs.write',
        'fs.delete',
        'fs.mkdir',
        'fs.rmdir',
        'fs.readdir',
        'fs.stat',
        'fs.exists',
        'proc.spawn',
        'proc.kill',
        'proc.list',
        'proc.get',
        'registry.list',
        'registry.get',
        'registry.isInstalled',
      ],
      fsAccess: [
        '/home/user/**',
        '/tmp/**',
        '/bin', // Read-only access to bin
      ],
    };

    // Store default permissions template (will be cloned per process)
    this.permissionManager.setPermission(0, defaultUserPermissions);
  }

  /**
   * Handle a syscall request
   */
  async handleSyscall(request: {
    id: string;
    syscall: string;
    args: Record<string, unknown>;
    pid?: number;
  }): Promise<{
    id: string;
    success: boolean;
    data?: unknown;
    error?: string;
  }> {
    return this.syscallRouter.handle({
      id: request.id,
      syscall: request.syscall,
      args: request.args,
      pid: request.pid,
    });
  }

  /**
   * Get security context for a process
   */
  getSecurityContext(pid: number) {
    return this.permissionManager.getSecurityContext(pid);
  }

  /**
   * Set permissions for a process
   */
  setPermissions(pid: number, permissions: {
    allowedSyscalls: string[];
    deniedSyscalls?: string[];
    fsAccess: string[];
  }): void {
    this.permissionManager.setPermission(pid, {
      pid,
      ...permissions,
    });
  }

  /**
   * Get filesystem instance
   */
  getFS(): FileSystem {
    return this.fs;
  }

  /**
   * Get process manager instance
   */
  getProcessManager(): ProcessManager {
    return this.procManager;
  }

  /**
   * Get app registry instance
   */
  getAppRegistry(): AppRegistry {
    return this.appRegistry;
  }

  /**
   * Get event bus instance
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }
}

