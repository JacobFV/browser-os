import type { SensorManager } from '@browser-os/sensor';
import type { SyscallHandler } from '../types';

export function createSensorSyscalls(sensorManager: SensorManager): Record<string, SyscallHandler> {
  return {
    'sensor.isSupported': async () => {
      return sensorManager.isSupported();
    },

    'sensor.startAccelerometer': async (args) => {
      const options = args.options as { frequency?: number } | undefined;
      await sensorManager.startAccelerometer(options);
      return null;
    },

    'sensor.stopAccelerometer': async () => {
      sensorManager.stopAccelerometer();
      return null;
    },

    'sensor.startGyroscope': async (args) => {
      const options = args.options as { frequency?: number } | undefined;
      await sensorManager.startGyroscope(options);
      return null;
    },

    'sensor.stopGyroscope': async () => {
      sensorManager.stopGyroscope();
      return null;
    },

    'sensor.startMagnetometer': async (args) => {
      const options = args.options as { frequency?: number } | undefined;
      await sensorManager.startMagnetometer(options);
      return null;
    },

    'sensor.stopMagnetometer': async () => {
      sensorManager.stopMagnetometer();
      return null;
    },

    'sensor.stopAll': async () => {
      sensorManager.stopAll();
      return null;
    },
  };
}

