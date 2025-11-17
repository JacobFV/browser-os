# @browser-os/location

Location (geolocation) management for Browser OS.

## Overview

The Location Manager provides access to geolocation services, allowing applications to get the current geographical position of the device. It uses the native Geolocation API.

## Usage

### Manager API

```typescript
import { LocationManager } from '@browser-os/location';
import { EventBus } from '@browser-os/events';

const eventBus = new EventBus();
const locationManager = new LocationManager({ eventBus });

// Get current position
const position = await locationManager.getCurrentPosition({
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
});

// Watch position changes
const watchId = locationManager.watchPosition((position) => {
  console.log('Position:', position.latitude, position.longitude);
});

// Clear watch
locationManager.clearWatch(watchId);
```

### Process API

Applications access location functionality through the `os.location` API:

```typescript
// Get current position
const position = await os.location.getCurrentPosition({
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
});
```

## API Reference

### LocationManager

#### Constructor

```typescript
constructor(options?: LocationManagerOptions)
```

**Options:**
- `eventBus?: EventBus` - Event bus for emitting location events

#### Methods

##### `getCurrentPosition(options?: PositionOptions): Promise<Position>`

Get the current geographical position of the device.

**Parameters:**
- `options?: PositionOptions` - Position options
  - `enableHighAccuracy?: boolean` - Use high accuracy (default: false)
  - `timeout?: number` - Timeout in milliseconds
  - `maximumAge?: number` - Maximum age of cached position in milliseconds

**Returns:** Promise resolving to position information.

**Example:**
```typescript
const position = await locationManager.getCurrentPosition({
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
});

console.log(`Latitude: ${position.latitude}`);
console.log(`Longitude: ${position.longitude}`);
console.log(`Accuracy: ${position.accuracy} meters`);
```

##### `watchPosition(callback: (position: Position) => void, options?: PositionOptions): number`

Watch position changes and call callback when position updates.

**Parameters:**
- `callback: (position: Position) => void` - Callback function called on position updates
- `options?: PositionOptions` - Position options

**Returns:** Watch ID for clearing the watch.

**Example:**
```typescript
const watchId = locationManager.watchPosition((position) => {
  console.log('New position:', position.latitude, position.longitude);
}, {
  enableHighAccuracy: true
});
```

##### `clearWatch(watchId: number): void`

Clear a position watch.

**Parameters:**
- `watchId: number` - Watch ID returned from watchPosition

**Example:**
```typescript
locationManager.clearWatch(watchId);
```

## Types

### Position

```typescript
interface Position {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  altitude: number | null; // meters
  altitudeAccuracy: number | null; // meters
  heading: number | null; // degrees (0-360)
  speed: number | null; // meters per second
  timestamp: number; // milliseconds since epoch
}
```

### PositionOptions

```typescript
interface PositionOptions {
  enableHighAccuracy?: boolean; // Use high accuracy GPS
  timeout?: number; // Timeout in milliseconds
  maximumAge?: number; // Maximum age of cached position in milliseconds
}
```

## Browser Compatibility

- **Geolocation API**: Chrome 5+, Firefox 3.5+, Safari 5+, Edge 12+, Opera 10.6+
- **HTTPS Required**: Geolocation requires HTTPS (except localhost)
- **Permissions**: Browser will prompt user for location permission

## Events

The LocationManager emits the following events via the event bus:

- `location:position` - Emitted when position is obtained or updated
- `location:error` - Emitted when location error occurs

## Syscalls

The following syscalls are registered when LocationManager is provided to the Kernel:

- `location.getCurrentPosition(options?)` - Get current geolocation position

## Security Notes

- Location access requires user permission (browser will prompt)
- HTTPS is required for geolocation (except localhost)
- Applications should only request location when needed
- Consider privacy implications when accessing user location

