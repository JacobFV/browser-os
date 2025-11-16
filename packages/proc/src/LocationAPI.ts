/**
 * Location API for processes to access geolocation
 */

export interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface PositionOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Location API factory
 */
export class LocationAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Get current position
   */
  async getCurrentPosition(options?: PositionOptions): Promise<Position> {
    return (await this.syscall('location.getCurrentPosition', { options })) as Position;
  }
}

