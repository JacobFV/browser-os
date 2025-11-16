import type { PowerManager } from '@browser-os/power';
import type { SyscallHandler } from '../types';

export function createPowerSyscalls(powerManager: PowerManager): Record<string, SyscallHandler> {
  return {
    'power.requestWakeLock': async (args) => {
      const type = (args.type as 'screen') ?? 'screen';
      return await powerManager.requestWakeLock(type);
    },

    'power.releaseWakeLock': async () => {
      await powerManager.releaseWakeLock();
      return null;
    },

    'power.isWakeLockActive': async () => {
      return powerManager.isWakeLockActive();
    },

    'power.getBatteryStatus': async () => {
      return await powerManager.getBatteryStatus();
    },

    'power.isOnBattery': async () => {
      return await powerManager.isOnBattery();
    },

    'power.getBatteryLevel': async () => {
      return await powerManager.getBatteryLevel();
    },
  };
}

