# @browser-os/power

Power management for Browser OS.

## Overview

The Power Manager provides access to power-related features including wake locks (to prevent screen sleep) and battery status information. It uses the Screen Wake Lock API and Battery Status API.

## Usage

### Manager API

```typescript
import { PowerManager } from '@browser-os/power';
import { EventBus } from '@browser-os/events';

const eventBus = new EventBus();
const powerManager = new PowerManager({ eventBus });

// Request wake lock
const acquired = await powerManager.requestWakeLock('screen');

// Release wake lock
await powerManager.releaseWakeLock();

// Check if wake lock is active
const isActive = powerManager.isWakeLockActive();

// Get battery status
const battery = await powerManager.getBatteryStatus();
// Returns: { charging: boolean, level: number, chargingTime: number | null, dischargingTime: number | null, supported: boolean } | null

// Check if on battery
const isOnBattery = await powerManager.isOnBattery();

// Get battery level
const batteryLevel = await powerManager.getBatteryLevel(); // 0-1
```

### Process API

Applications access power functionality through the `os.power` API:

```typescript
// Wake lock management
const acquired = await os.power.requestWakeLock('screen');
await os.power.releaseWakeLock();
const isActive = await os.power.isWakeLockActive();

// Battery status
const battery = await os.power.getBatteryStatus();
const isOnBattery = await os.power.isOnBattery();
const batteryLevel = await os.power.getBatteryLevel(); // 0-1
```

## API Reference

### PowerManager

#### Constructor

```typescript
constructor(options?: PowerManagerOptions)
```

**Options:**
- `eventBus?: EventBus` - Event bus for emitting power events

#### Methods

##### `requestWakeLock(type: 'screen'): Promise<boolean>`

Request a wake lock to prevent the screen from sleeping.

**Parameters:**
- `type: 'screen'` - Type of wake lock (currently only 'screen' is supported)

**Returns:** Promise resolving to true if wake lock was acquired, false otherwise.

**Example:**
```typescript
const acquired = await powerManager.requestWakeLock('screen');
if (acquired) {
  console.log('Wake lock acquired');
}
```

##### `releaseWakeLock(): Promise<void>`

Release the active wake lock.

**Example:**
```typescript
await powerManager.releaseWakeLock();
```

##### `isWakeLockActive(): boolean`

Check if a wake lock is currently active.

**Returns:** True if wake lock is active, false otherwise.

**Example:**
```typescript
if (powerManager.isWakeLockActive()) {
  console.log('Screen will not sleep');
}
```

##### `getBatteryStatus(): Promise<BatteryStatus | null>`

Get the current battery status.

**Returns:** Promise resolving to battery status or null if not supported.

**BatteryStatus:**
```typescript
{
  charging: boolean;
  level: number; // 0-1
  chargingTime: number | null; // seconds until fully charged
  dischargingTime: number | null; // seconds until empty
  supported: boolean;
}
```

**Example:**
```typescript
const battery = await powerManager.getBatteryStatus();
if (battery && battery.supported) {
  console.log(`Battery: ${(battery.level * 100).toFixed(0)}%`);
  console.log(`Charging: ${battery.charging}`);
}
```

##### `isOnBattery(): Promise<boolean>`

Check if the device is currently running on battery power (not charging).

**Returns:** Promise resolving to true if on battery, false if charging or not supported.

**Example:**
```typescript
const onBattery = await powerManager.isOnBattery();
if (onBattery) {
  console.log('Running on battery power');
}
```

##### `getBatteryLevel(): Promise<number | null>`

Get the current battery level.

**Returns:** Promise resolving to battery level (0-1) or null if not supported.

**Example:**
```typescript
const level = await powerManager.getBatteryLevel();
if (level !== null) {
  console.log(`Battery level: ${(level * 100).toFixed(0)}%`);
}
```

## Types

### BatteryStatus

```typescript
interface BatteryStatus {
  charging: boolean;
  level: number; // 0-1
  chargingTime: number | null; // seconds until fully charged
  dischargingTime: number | null; // seconds until empty
  supported: boolean;
}
```

## Browser Compatibility

- **Wake Lock API**: Chrome 84+, Edge 84+, Opera 70+, Safari 15.4+
- **Battery Status API**: Chrome 38+, Edge 79+, Opera 25+ (deprecated but still works)
- **Note**: Battery Status API is deprecated but still functional in many browsers

## Events

The PowerManager emits the following events via the event bus:

- `power:wakeLockAcquired` - Emitted when wake lock is acquired
- `power:wakeLockReleased` - Emitted when wake lock is released
- `power:chargingChange` - Emitted when charging state changes
- `power:levelChange` - Emitted when battery level changes

## Syscalls

The following syscalls are registered when PowerManager is provided to the Kernel:

- `power.requestWakeLock(type)` - Request wake lock
- `power.releaseWakeLock()` - Release wake lock
- `power.isWakeLockActive()` - Check if wake lock is active
- `power.getBatteryStatus()` - Get battery status
- `power.isOnBattery()` - Check if on battery power
- `power.getBatteryLevel()` - Get battery level

