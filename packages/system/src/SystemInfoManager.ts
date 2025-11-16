import type { EventBus } from '@browser-os/events';

export interface SystemInfoManagerOptions {
  eventBus?: EventBus;
}

export interface SystemInfo {
  platform: string;
  userAgent: string;
  language: string;
  languages: string[];
  timezone: string;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  pixelRatio: number;
  online: boolean;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  deviceMemory?: number;
}

/**
 * System Info Manager for querying system information
 */
export class SystemInfoManager {
  private eventBus?: EventBus;

  constructor(options?: SystemInfoManagerOptions) {
    this.eventBus = options?.eventBus;
  }

  /**
   * Get system information
   */
  getSystemInfo(): SystemInfo {
    return {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: [...navigator.languages],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      deviceMemory: (navigator as any).deviceMemory,
    };
  }

  /**
   * Get platform name
   */
  getPlatform(): string {
    return navigator.platform;
  }

  /**
   * Get user agent
   */
  getUserAgent(): string {
    return navigator.userAgent;
  }

  /**
   * Get language
   */
  getLanguage(): string {
    return navigator.language;
  }

  /**
   * Get all languages
   */
  getLanguages(): string[] {
    return [...navigator.languages];
  }

  /**
   * Get timezone
   */
  getTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Get screen dimensions
   */
  getScreenSize(): { width: number; height: number } {
    return {
      width: window.screen.width,
      height: window.screen.height,
    };
  }

  /**
   * Get online status
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get hardware concurrency (CPU cores)
   */
  getHardwareConcurrency(): number {
    return navigator.hardwareConcurrency;
  }
}

