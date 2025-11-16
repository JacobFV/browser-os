import type { EventBus } from '@browser-os/events';

export interface LocationManagerOptions {
  eventBus?: EventBus;
}

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
 * Location Manager for geolocation
 */
export class LocationManager {
  private eventBus?: EventBus;
  private watchId: number | null = null;

  constructor(options?: LocationManagerOptions) {
    this.eventBus = options?.eventBus;
  }

  /**
   * Get current position
   */
  async getCurrentPosition(options?: PositionOptions): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos: Position = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          };
          this.eventBus?.emit('location:position', pos, { source: 'location-manager' });
          resolve(pos);
        },
        (error) => {
          this.eventBus?.emit('location:error', { error: error.message }, { source: 'location-manager' });
          reject(error);
        },
        options
      );
    });
  }

  /**
   * Watch position changes
   */
  watchPosition(callback: (position: Position) => void, options?: PositionOptions): number {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const pos: Position = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        };
        this.eventBus?.emit('location:position', pos, { source: 'location-manager' });
        callback(pos);
      },
      (error) => {
        this.eventBus?.emit('location:error', { error: error.message }, { source: 'location-manager' });
      },
      options
    );

    this.watchId = watchId;
    return watchId;
  }

  /**
   * Clear position watch
   */
  clearWatch(watchId: number): void {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
      if (this.watchId === watchId) {
        this.watchId = null;
      }
    }
  }
}

