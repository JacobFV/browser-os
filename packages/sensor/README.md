# @browser-os/sensor

Sensor management for Browser OS.

## Overview

The Sensor Manager provides access to device sensors including accelerometer, gyroscope, and magnetometer. It uses the Generic Sensor API when available. Sensor readings are emitted as events via the event bus.

## Usage

### Manager API

```typescript
import { SensorManager } from '@browser-os/sensor';
import { EventBus } from '@browser-os/events';

const eventBus = new EventBus();
const sensorManager = new SensorManager({ eventBus });

// Check if sensors are supported
const supported = sensorManager.isSupported();

// Start accelerometer
await sensorManager.startAccelerometer({ frequency: 60 });

// Start gyroscope
await sensorManager.startGyroscope({ frequency: 60 });

// Start magnetometer
await sensorManager.startMagnetometer({ frequency: 60 });

// Stop sensors
sensorManager.stopAccelerometer();
sensorManager.stopGyroscope();
sensorManager.stopMagnetometer();
sensorManager.stopAll();
```

### Process API

Applications access sensor functionality through the `os.sensor` API:

```typescript
// Check support
const supported = await os.sensor.isSupported();

// Accelerometer
await os.sensor.startAccelerometer({ frequency: 60 });
await os.sensor.stopAccelerometer();

// Gyroscope
await os.sensor.startGyroscope({ frequency: 60 });
await os.sensor.stopGyroscope();

// Magnetometer
await os.sensor.startMagnetometer({ frequency: 60 });
await os.sensor.stopMagnetometer();

// Stop all sensors
await os.sensor.stopAll();
```

## API Reference

### SensorManager

#### Constructor

```typescript
constructor(options?: SensorManagerOptions)
```

**Options:**
- `eventBus?: EventBus` - Event bus for emitting sensor events

#### Methods

##### `isSupported(): boolean`

Check if sensors are supported on the device.

**Returns:** True if any sensor type is supported.

**Example:**
```typescript
if (sensorManager.isSupported()) {
  console.log('Sensors are supported');
}
```

##### `startAccelerometer(options?: SensorOptions): Promise<void>`

Start accelerometer sensor.

**Parameters:**
- `options?: SensorOptions` - Sensor options
  - `frequency?: number` - Sampling frequency in Hz

**Throws:** Error if accelerometer is not supported.

**Example:**
```typescript
await sensorManager.startAccelerometer({ frequency: 60 });
```

##### `stopAccelerometer(): void`

Stop accelerometer sensor.

**Example:**
```typescript
sensorManager.stopAccelerometer();
```

##### `startGyroscope(options?: SensorOptions): Promise<void>`

Start gyroscope sensor.

**Parameters:**
- `options?: SensorOptions` - Sensor options
  - `frequency?: number` - Sampling frequency in Hz

**Throws:** Error if gyroscope is not supported.

**Example:**
```typescript
await sensorManager.startGyroscope({ frequency: 60 });
```

##### `stopGyroscope(): void`

Stop gyroscope sensor.

**Example:**
```typescript
sensorManager.stopGyroscope();
```

##### `startMagnetometer(options?: SensorOptions): Promise<void>`

Start magnetometer sensor.

**Parameters:**
- `options?: SensorOptions` - Sensor options
  - `frequency?: number` - Sampling frequency in Hz

**Throws:** Error if magnetometer is not supported.

**Example:**
```typescript
await sensorManager.startMagnetometer({ frequency: 60 });
```

##### `stopMagnetometer(): void`

Stop magnetometer sensor.

**Example:**
```typescript
sensorManager.stopMagnetometer();
```

##### `stopAll(): void`

Stop all active sensors.

**Example:**
```typescript
sensorManager.stopAll();
```

## Types

### SensorReading

```typescript
interface SensorReading {
  x: number | null; // X-axis value
  y: number | null; // Y-axis value
  z: number | null; // Z-axis value
  timestamp: number; // Timestamp in milliseconds
}
```

### SensorOptions

```typescript
interface SensorOptions {
  frequency?: number; // Sampling frequency in Hz
}
```

## Browser Compatibility

- **Generic Sensor API**: Chrome 67+, Edge 79+, Opera 54+
- **Accelerometer**: Chrome 67+, Edge 79+
- **Gyroscope**: Chrome 67+, Edge 79+
- **Magnetometer**: Chrome 67+, Edge 79+
- **HTTPS Required**: Sensors require HTTPS (except localhost)
- **Note**: Not supported in Firefox or Safari

## Events

The SensorManager emits the following events via the event bus:

- `sensor:accelerometer` - Emitted when accelerometer reading is available
  - Data: `SensorReading` with x, y, z values in m/s²
- `sensor:gyroscope` - Emitted when gyroscope reading is available
  - Data: `SensorReading` with x, y, z values in rad/s
- `sensor:magnetometer` - Emitted when magnetometer reading is available
  - Data: `SensorReading` with x, y, z values in μT (microteslas)
- `sensor:error` - Emitted when sensor error occurs
- `sensor:allStopped` - Emitted when all sensors are stopped

**Example event listener:**
```typescript
eventBus.on('sensor:accelerometer', (reading) => {
  console.log('Accelerometer:', reading.x, reading.y, reading.z);
});
```

## Syscalls

The following syscalls are registered when SensorManager is provided to the Kernel:

- `sensor.isSupported()` - Check if sensors are supported
- `sensor.startAccelerometer(options?)` - Start accelerometer
- `sensor.stopAccelerometer()` - Stop accelerometer
- `sensor.startGyroscope(options?)` - Start gyroscope
- `sensor.stopGyroscope()` - Stop gyroscope
- `sensor.startMagnetometer(options?)` - Start magnetometer
- `sensor.stopMagnetometer()` - Stop magnetometer
- `sensor.stopAll()` - Stop all sensors

## Security Notes

- Sensor access requires HTTPS (except localhost)
- Sensors may require user permission on some devices
- Applications should stop sensors when not needed to save battery
- Sensor readings can be sensitive (device orientation, movement)

