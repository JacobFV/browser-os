import type { SystemInfoManager } from '@browser-os/system';
import type { SyscallHandler } from '../types';

export function createSystemSyscalls(systemInfoManager: SystemInfoManager): Record<string, SyscallHandler> {
  return {
    'system.getInfo': async () => {
      return systemInfoManager.getSystemInfo();
    },

    'system.getPlatform': async () => {
      return systemInfoManager.getPlatform();
    },

    'system.getUserAgent': async () => {
      return systemInfoManager.getUserAgent();
    },

    'system.getLanguage': async () => {
      return systemInfoManager.getLanguage();
    },

    'system.getLanguages': async () => {
      return systemInfoManager.getLanguages();
    },

    'system.getTimezone': async () => {
      return systemInfoManager.getTimezone();
    },

    'system.getScreenSize': async () => {
      return systemInfoManager.getScreenSize();
    },

    'system.isOnline': async () => {
      return systemInfoManager.isOnline();
    },

    'system.getHardwareConcurrency': async () => {
      return systemInfoManager.getHardwareConcurrency();
    },
  };
}

