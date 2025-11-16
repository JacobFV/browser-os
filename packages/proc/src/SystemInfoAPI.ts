/**
 * System Info API for processes to query system information
 */

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
 * System Info API factory
 */
export class SystemInfoAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Get all system information
   */
  async getInfo(): Promise<SystemInfo> {
    return (await this.syscall('system.getInfo', {})) as SystemInfo;
  }

  /**
   * Get platform name
   */
  async getPlatform(): Promise<string> {
    return (await this.syscall('system.getPlatform', {})) as string;
  }

  /**
   * Get user agent
   */
  async getUserAgent(): Promise<string> {
    return (await this.syscall('system.getUserAgent', {})) as string;
  }

  /**
   * Get language
   */
  async getLanguage(): Promise<string> {
    return (await this.syscall('system.getLanguage', {})) as string;
  }

  /**
   * Get all languages
   */
  async getLanguages(): Promise<string[]> {
    return (await this.syscall('system.getLanguages', {})) as string[];
  }

  /**
   * Get timezone
   */
  async getTimezone(): Promise<string> {
    return (await this.syscall('system.getTimezone', {})) as string;
  }

  /**
   * Get screen dimensions
   */
  async getScreenSize(): Promise<{ width: number; height: number }> {
    return (await this.syscall('system.getScreenSize', {})) as { width: number; height: number };
  }

  /**
   * Check if online
   */
  async isOnline(): Promise<boolean> {
    return (await this.syscall('system.isOnline', {})) as boolean;
  }

  /**
   * Get hardware concurrency (CPU cores)
   */
  async getHardwareConcurrency(): Promise<number> {
    return (await this.syscall('system.getHardwareConcurrency', {})) as number;
  }
}

