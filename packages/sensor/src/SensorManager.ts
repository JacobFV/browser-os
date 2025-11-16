import type { EventBus } from '@browser-os/events';

export interface SensorManagerOptions {
  eventBus?: EventBus;
}

export interface SensorReading {
  x: number | null;
  y: number | null;
  z: number | null;
  timestamp: number;
}

export interface SensorOptions {
  frequency?: number; // Hz
}

// Type definitions for Generic Sensor API
interface AccelerometerOptions {
  frequency?: number;
}

interface GyroscopeOptions {
  frequency?: number;
}

interface MagnetometerOptions {
  frequency?: number;
}

interface Sensor {
  x: number | null;
  y: number | null;
  z: number | null;
  timestamp: number;
  start(): void;
  stop(): void;
  addEventListener(type: string, listener: (event: any) => void): void;
}

interface Accelerometer extends Sensor {}
interface Gyroscope extends Sensor {}
interface Magnetometer extends Sensor {}

declare global {
  interface Window {
    Accelerometer: new (options?: AccelerometerOptions) => Accelerometer;
    Gyroscope: new (options?: GyroscopeOptions) => Gyroscope;
    Magnetometer: new (options?: MagnetometerOptions) => Magnetometer;
  }
}

/**
 * Sensor Manager for device sensors (accelerometer, gyroscope, etc.)
 * Uses Generic Sensor API when available
 */
export class SensorManager {
  private eventBus?: EventBus;
  private accelerometer: Accelerometer | null = null;
  private gyroscope: Gyroscope | null = null;
  private magnetometer: Magnetometer | null = null;

  constructor(options?: SensorManagerOptions) {
    this.eventBus = options?.eventBus;
  }

  /**
   * Check if sensors are supported
   */
  isSupported(): boolean {
    return 'Accelerometer' in window || 'Gyroscope' in window || 'Magnetometer' in window;
  }

  /**
   * Start accelerometer
   */
  async startAccelerometer(options?: SensorOptions): Promise<void> {
    if (!('Accelerometer' in window)) {
      throw new Error('Accelerometer is not supported');
    }

    if (this.accelerometer) {
      this.accelerometer.stop();
    }

    const sensorOptions: AccelerometerOptions = {};
    if (options?.frequency) {
      sensorOptions.frequency = options.frequency;
    }

    const accelerometer = new (window as any).Accelerometer(sensorOptions);
    this.accelerometer = accelerometer;

    accelerometer.addEventListener('reading', () => {
      const reading: SensorReading = {
        x: accelerometer.x ?? null,
        y: accelerometer.y ?? null,
        z: accelerometer.z ?? null,
        timestamp: accelerometer.timestamp,
      };
      this.eventBus?.emit('sensor:accelerometer', reading, { source: 'sensor-manager' });
    });

    accelerometer.addEventListener('error', (event: any) => {
      this.eventBus?.emit('sensor:error', { sensor: 'accelerometer', error: event.error.message }, { source: 'sensor-manager' });
    });

    accelerometer.start();
  }

  /**
   * Stop accelerometer
   */
  stopAccelerometer(): void {
    if (this.accelerometer) {
      this.accelerometer.stop();
      this.accelerometer = null;
    }
  }

  /**
   * Start gyroscope
   */
  async startGyroscope(options?: SensorOptions): Promise<void> {
    if (!('Gyroscope' in window)) {
      throw new Error('Gyroscope is not supported');
    }

    if (this.gyroscope) {
      this.gyroscope.stop();
    }

    const sensorOptions: GyroscopeOptions = {};
    if (options?.frequency) {
      sensorOptions.frequency = options.frequency;
    }

    const gyroscope = new (window as any).Gyroscope(sensorOptions);
    this.gyroscope = gyroscope;

    gyroscope.addEventListener('reading', () => {
      const reading: SensorReading = {
        x: gyroscope.x ?? null,
        y: gyroscope.y ?? null,
        z: gyroscope.z ?? null,
        timestamp: gyroscope.timestamp,
      };
      this.eventBus?.emit('sensor:gyroscope', reading, { source: 'sensor-manager' });
    });

    gyroscope.addEventListener('error', (event: any) => {
      this.eventBus?.emit('sensor:error', { sensor: 'gyroscope', error: event.error.message }, { source: 'sensor-manager' });
    });

    gyroscope.start();
  }

  /**
   * Stop gyroscope
   */
  stopGyroscope(): void {
    if (this.gyroscope) {
      this.gyroscope.stop();
      this.gyroscope = null;
    }
  }

  /**
   * Start magnetometer
   */
  async startMagnetometer(options?: SensorOptions): Promise<void> {
    if (!('Magnetometer' in window)) {
      throw new Error('Magnetometer is not supported');
    }

    if (this.magnetometer) {
      this.magnetometer.stop();
    }

    const sensorOptions: MagnetometerOptions = {};
    if (options?.frequency) {
      sensorOptions.frequency = options.frequency;
    }

    const magnetometer = new (window as any).Magnetometer(sensorOptions);
    this.magnetometer = magnetometer;

    magnetometer.addEventListener('reading', () => {
      const reading: SensorReading = {
        x: magnetometer.x ?? null,
        y: magnetometer.y ?? null,
        z: magnetometer.z ?? null,
        timestamp: magnetometer.timestamp,
      };
      this.eventBus?.emit('sensor:magnetometer', reading, { source: 'sensor-manager' });
    });

    magnetometer.addEventListener('error', (event: any) => {
      this.eventBus?.emit('sensor:error', { sensor: 'magnetometer', error: event.error.message }, { source: 'sensor-manager' });
    });

    magnetometer.start();
  }

  /**
   * Stop magnetometer
   */
  stopMagnetometer(): void {
    if (this.magnetometer) {
      this.magnetometer.stop();
      this.magnetometer = null;
    }
  }

  /**
   * Stop all sensors
   */
  stopAll(): void {
    this.stopAccelerometer();
    this.stopGyroscope();
    this.stopMagnetometer();
  }
}

