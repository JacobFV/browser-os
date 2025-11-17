# @browser-os/media

Media (camera/microphone) management for Browser OS.

## Overview

The Media Manager provides access to camera and microphone devices through the WebRTC MediaDevices API. It allows applications to request media streams, stop streams, and enumerate available devices.

## Usage

### Manager API

```typescript
import { MediaManager } from '@browser-os/media';
import { EventBus } from '@browser-os/events';

const eventBus = new EventBus();
const mediaManager = new MediaManager({ eventBus });

// Request media access
const { streamId, tracks } = await mediaManager.getUserMedia({
  video: true,
  audio: true
});

// Stop stream
mediaManager.stopStream(streamId);
mediaManager.stopAllStreams();

// Enumerate devices
const devices = await mediaManager.enumerateDevices();
```

### Process API

Applications access media functionality through the `os.media` API:

```typescript
// Request media access
const { streamId, tracks } = await os.media.getUserMedia({
  video: true,
  audio: true
});

// Stop stream
await os.media.stopStream(streamId);
await os.media.stopAllStreams();

// Enumerate devices
const devices = await os.media.enumerateDevices();
```

## API Reference

### MediaManager

#### Constructor

```typescript
constructor(options?: MediaManagerOptions)
```

**Options:**
- `eventBus?: EventBus` - Event bus for emitting media events

#### Methods

##### `getUserMedia(constraints: MediaStreamConstraints): Promise<{ streamId: string; tracks: MediaTrackInfo[] }>`

Request access to camera and/or microphone.

**Parameters:**
- `constraints: MediaStreamConstraints` - Media constraints
  - `video?: boolean | MediaTrackConstraints` - Video constraints
  - `audio?: boolean | MediaTrackConstraints` - Audio constraints

**Returns:** Promise resolving to stream ID and track information.

**Example:**
```typescript
// Request both video and audio
const { streamId, tracks } = await mediaManager.getUserMedia({
  video: true,
  audio: true
});

// Request video only with specific constraints
const { streamId, tracks } = await mediaManager.getUserMedia({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 }
  },
  audio: false
});
```

##### `stopStream(streamId: string): void`

Stop a specific media stream.

**Parameters:**
- `streamId: string` - ID of the stream to stop

**Example:**
```typescript
mediaManager.stopStream(streamId);
```

##### `stopAllStreams(): void`

Stop all active media streams.

**Example:**
```typescript
mediaManager.stopAllStreams();
```

##### `enumerateDevices(): Promise<MediaDeviceInfo[]>`

Enumerate available media input and output devices.

**Returns:** Promise resolving to array of device information.

**Example:**
```typescript
const devices = await mediaManager.enumerateDevices();
devices.forEach(device => {
  console.log(`${device.kind}: ${device.label} (${device.deviceId})`);
});
```

##### `getStream(streamId: string): MediaStream | null`

Get the native MediaStream object by ID.

**Parameters:**
- `streamId: string` - ID of the stream

**Returns:** MediaStream object or null if not found.

**Example:**
```typescript
const stream = mediaManager.getStream(streamId);
if (stream) {
  // Use native MediaStream API
  const videoTrack = stream.getVideoTracks()[0];
}
```

## Types

### MediaStreamConstraints

```typescript
interface MediaStreamConstraints {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}
```

### MediaTrackInfo

```typescript
interface MediaTrackInfo {
  id: string;
  kind: string; // 'video' | 'audio'
  label: string;
}
```

### MediaDeviceInfo

```typescript
interface MediaDeviceInfo {
  deviceId: string;
  kind: string; // 'videoinput' | 'audioinput' | 'audiooutput'
  label: string;
  groupId: string;
}
```

## Browser Compatibility

- **MediaDevices API**: Chrome 53+, Firefox 36+, Safari 11+, Edge 12+
- **getUserMedia**: Requires HTTPS (except localhost)
- **Permissions**: Browser will prompt user for camera/microphone access

## Events

The MediaManager emits the following events via the event bus:

- `media:streamCreated` - Emitted when a media stream is created
- `media:streamStopped` - Emitted when a media stream is stopped
- `media:trackEnded` - Emitted when a media track ends
- `media:error` - Emitted when a media error occurs

## Syscalls

The following syscalls are registered when MediaManager is provided to the Kernel:

- `media.getUserMedia(constraints)` - Request camera/microphone access
- `media.stopStream(streamId)` - Stop a media stream
- `media.stopAllStreams()` - Stop all media streams
- `media.enumerateDevices()` - Enumerate available devices

## Security Notes

- Media access requires user permission (browser will prompt)
- HTTPS is required for getUserMedia (except localhost)
- Applications should request only the media they need
- Always stop streams when done to free resources

