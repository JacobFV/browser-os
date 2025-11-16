import type { EventBus } from '@browser-os/events';

export interface PowerManagerOptions {
  eventBus?: EventBus;
}

/**
 * Power Manager for managing power state
 * Note: Browser APIs for power management are limited
 */
export class PowerManager {
  private eventBus?: EventBus;
  private wakeLock: WakeLockSentinel | null = null;

  constructor(options?: PowerManagerOptions) {
    this.eventBus = options?.eventBus;
  }

  /**
   * Request wake lock to prevent screen from sleeping
   */
  async requestWakeLock(type: 'screen' = 'screen'): Promise<boolean> {
    try {
      if (!('wakeLock' in navigator)) {
        return false;
      }

      if (type === 'screen') {
        const wakeLock = await (navigator as any).wakeLock.request('screen');
        this.wakeLock = wakeLock;
        
        // Listen for release events
        wakeLock.addEventListener('release', () => {
          this.eventBus?.emit('power:wakeLockReleased', {}, { source: 'power-manager' });
          this.wakeLock = null;
        });

        this.eventBus?.emit('power:wakeLockAcquired', { type }, { source: 'power-manager' });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to request wake lock:', error);
      return false;
    }
  }

  /**
   * Release wake lock
   */
  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
      this.eventBus?.emit('power:wakeLockReleased', {}, { source: 'power-manager' });
    }
  }

  /**
   * Check if wake lock is active
   */
  isWakeLockActive(): boolean {
    return this.wakeLock !== null && !this.wakeLock.released;
  }

  /**
   * Get battery status (if available)
   */
  async getBatteryStatus(): Promise<{
    charging: boolean;
    chargingTime: number | null;
    dischargingTime: number | null;
    level: number;
    supported: boolean;
  } | null> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return {
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
          level: battery.level,
          supported: true,
        };
      }
      return {
        charging: false,
        chargingTime: null,
        dischargingTime: null,
        level: 1.0,
        supported: false,
      };
    } catch (error) {
      console.error('Failed to get battery status:', error);
      return null;
    }
  }

  /**
   * Check if device is on battery power
   */
  async isOnBattery(): Promise<boolean> {
    const battery = await this.getBatteryStatus();
    if (battery && battery.supported) {
      return !battery.charging;
    }
    return false;
  }

  /**
   * Get battery level (0-1)
   */
  async getBatteryLevel(): Promise<number | null> {
    const battery = await this.getBatteryStatus();
    return battery ? battery.level : null;
  }
}

