/**
 * Sensor API for processes to access device sensors
 */

export interface SensorReading {
  x: number | null;
  y: number | null;
  z: number | null;
  timestamp: number;
}

export interface SensorOptions {
  frequency?: number; // Hz
}

/**
 * Sensor API factory
 */
export class SensorAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Check if sensors are supported
   */
  async isSupported(): Promise<boolean> {
    return (await this.syscall('sensor.isSupported', {})) as boolean;
  }

  /**
   * Start accelerometer
   */
  async startAccelerometer(options?: SensorOptions): Promise<void> {
    await this.syscall('sensor.startAccelerometer', { options });
  }

  /**
   * Stop accelerometer
   */
  async stopAccelerometer(): Promise<void> {
    await this.syscall('sensor.stopAccelerometer', {});
  }

  /**
   * Start gyroscope
   */
  async startGyroscope(options?: SensorOptions): Promise<void> {
    await this.syscall('sensor.startGyroscope', { options });
  }

  /**
   * Stop gyroscope
   */
  async stopGyroscope(): Promise<void> {
    await this.syscall('sensor.stopGyroscope', {});
  }

  /**
   * Start magnetometer
   */
  async startMagnetometer(options?: SensorOptions): Promise<void> {
    await this.syscall('sensor.startMagnetometer', { options });
  }

  /**
   * Stop magnetometer
   */
  async stopMagnetometer(): Promise<void> {
    await this.syscall('sensor.stopMagnetometer', {});
  }

  /**
   * Stop all sensors
   */
  async stopAll(): Promise<void> {
    await this.syscall('sensor.stopAll', {});
  }
}

