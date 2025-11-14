import type { AppRegistry } from '@browser-os/app-registry';
import type { SyscallHandler } from '../types';

export function createRegistrySyscalls(appRegistry: AppRegistry): Record<string, SyscallHandler> {
  return {
    'registry.list': async (args, context) => {
      // Check permission
      if (!context.canSyscall('registry.list')) {
        throw new Error('Permission denied: cannot list apps');
      }

      const enabled = args.enabled as boolean | undefined;
      const apps = enabled ? appRegistry.getEnabled() : appRegistry.list();
      return apps;
    },

    'registry.get': async (args, context) => {
      const appId = args.appId as string;
      if (!appId) throw new Error('appId required');

      // Check permission
      if (!context.canSyscall('registry.get')) {
        throw new Error('Permission denied: cannot get app info');
      }

      return appRegistry.get(appId);
    },

    'registry.isInstalled': async (args, context) => {
      const appId = args.appId as string;
      if (!appId) throw new Error('appId required');

      // Check permission
      if (!context.canSyscall('registry.isInstalled')) {
        throw new Error('Permission denied: cannot check app installation');
      }

      return appRegistry.isInstalled(appId);
    },
  };
}

