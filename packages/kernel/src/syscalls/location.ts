import type { LocationManager } from '@browser-os/location';
import type { SyscallHandler } from '../types';

export function createLocationSyscalls(locationManager: LocationManager): Record<string, SyscallHandler> {
  return {
    'location.getCurrentPosition': async (args) => {
      const options = args.options as {
        enableHighAccuracy?: boolean;
        timeout?: number;
        maximumAge?: number;
      } | undefined;

      return await locationManager.getCurrentPosition(options);
    },
  };
}

