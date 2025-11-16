/**
 * Power API for processes to manage power state
 */

export interface BatteryStatus {
  charging: boolean;
  chargingTime: number | null;
  dischargingTime: number | null;
  level: number;
  supported: boolean;
}

/**
 * Power API factory
 */
export class PowerAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Request wake lock to prevent screen from sleeping
   */
  async requestWakeLock(type: 'screen' = 'screen'): Promise<boolean> {
    return (await this.syscall('power.requestWakeLock', { type })) as boolean;
  }

  /**
   * Release wake lock
   */
  async releaseWakeLock(): Promise<void> {
    await this.syscall('power.releaseWakeLock', {});
  }

  /**
   * Check if wake lock is active
   */
  async isWakeLockActive(): Promise<boolean> {
    return (await this.syscall('power.isWakeLockActive', {})) as boolean;
  }

  /**
   * Get battery status
   */
  async getBatteryStatus(): Promise<BatteryStatus | null> {
    return (await this.syscall('power.getBatteryStatus', {})) as BatteryStatus | null;
  }

  /**
   * Check if device is on battery power
   */
  async isOnBattery(): Promise<boolean> {
    return (await this.syscall('power.isOnBattery', {})) as boolean;
  }

  /**
   * Get battery level (0-1)
   */
  async getBatteryLevel(): Promise<number | null> {
    return (await this.syscall('power.getBatteryLevel', {})) as number | null;
  }
}

