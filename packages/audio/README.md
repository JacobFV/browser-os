# @browser-os/audio

Audio management for Browser OS.

## Overview

The Audio Manager provides audio playback capabilities, allowing applications to play audio files from URLs, control playback (play, pause, stop, resume), adjust volume, and generate beep sounds. It uses the HTMLAudioElement API and Web Audio API.

## Usage

### Manager API

```typescript
import { AudioManager } from '@browser-os/audio';
import { EventBus } from '@browser-os/events';

const eventBus = new EventBus();
const audioManager = new AudioManager({ eventBus });

// Play audio from URL
const audioId = await audioManager.play('https://example.com/sound.mp3', {
  volume: 0.8,
  loop: false,
  playbackRate: 1.0
});

// Control playback
audioManager.pause(audioId);
audioManager.resume(audioId);
audioManager.stop(audioId);

// Volume control
audioManager.setVolume(audioId, 0.5);
const volume = audioManager.getVolume(audioId);

// System beep
await audioManager.beep(440, 200); // frequency (Hz), duration (ms)
```

### Process API

Applications access audio functionality through the `os.audio` API:

```typescript
// Play audio from URL
const audioId = await os.audio.play('https://example.com/sound.mp3', {
  volume: 0.8,
  loop: false,
  playbackRate: 1.0
});

// Control playback
await os.audio.pause(audioId);
await os.audio.resume(audioId);
await os.audio.stop(audioId);

// Volume control
await os.audio.setVolume(audioId, 0.5);
const volume = await os.audio.getVolume(audioId);

// System beep
await os.audio.beep(440, 200); // frequency (Hz), duration (ms)
```

## API Reference

### AudioManager

#### Constructor

```typescript
constructor(options?: AudioManagerOptions)
```

**Options:**
- `eventBus?: EventBus` - Event bus for emitting audio events

#### Methods

##### `play(url: string, options?: AudioPlayOptions): Promise<string>`

Play audio from a URL.

**Parameters:**
- `url: string` - URL of the audio file
- `options?: AudioPlayOptions` - Playback options
  - `volume?: number` - Volume level (0-1, default: 1.0)
  - `loop?: boolean` - Whether to loop (default: false)
  - `playbackRate?: number` - Playback rate (default: 1.0)

**Returns:** Promise resolving to audio ID for controlling playback.

**Example:**
```typescript
const audioId = await audioManager.play('https://example.com/sound.mp3', {
  volume: 0.8,
  loop: true
});
```

##### `stop(audioId: string): void`

Stop audio playback and reset to beginning.

**Parameters:**
- `audioId: string` - ID of the audio to stop

**Example:**
```typescript
audioManager.stop(audioId);
```

##### `pause(audioId: string): void`

Pause audio playback.

**Parameters:**
- `audioId: string` - ID of the audio to pause

**Example:**
```typescript
audioManager.pause(audioId);
```

##### `resume(audioId: string): Promise<void>`

Resume paused audio playback.

**Parameters:**
- `audioId: string` - ID of the audio to resume

**Example:**
```typescript
await audioManager.resume(audioId);
```

##### `setVolume(audioId: string, volume: number): void`

Set volume for a specific audio playback.

**Parameters:**
- `audioId: string` - ID of the audio
- `volume: number` - Volume level (0-1)

**Example:**
```typescript
audioManager.setVolume(audioId, 0.5); // 50% volume
```

##### `getVolume(audioId: string): number | null`

Get current volume for a specific audio playback.

**Parameters:**
- `audioId: string` - ID of the audio

**Returns:** Volume level (0-1) or null if audio not found.

**Example:**
```typescript
const volume = audioManager.getVolume(audioId);
if (volume !== null) {
  console.log(`Volume: ${(volume * 100).toFixed(0)}%`);
}
```

##### `beep(frequency?: number, duration?: number): Promise<void>`

Play a system beep sound using Web Audio API.

**Parameters:**
- `frequency?: number` - Frequency in Hz (default: 440)
- `duration?: number` - Duration in milliseconds (default: 200)

**Example:**
```typescript
await audioManager.beep(440, 200); // A4 note for 200ms
```

## Types

### AudioPlayOptions

```typescript
interface AudioPlayOptions {
  volume?: number; // 0-1
  loop?: boolean;
  playbackRate?: number;
}
```

## Browser Compatibility

- **HTMLAudioElement**: All modern browsers
- **Web Audio API**: Chrome 14+, Firefox 25+, Safari 6+, Edge 12+
- **Audio formats**: MP3, OGG, WAV (browser-dependent)

## Events

The AudioManager emits the following events via the event bus:

- `audio:playing` - Emitted when audio starts playing
- `audio:ended` - Emitted when audio finishes playing
- `audio:paused` - Emitted when audio is paused
- `audio:resumed` - Emitted when audio is resumed
- `audio:stopped` - Emitted when audio is stopped
- `audio:error` - Emitted when audio playback error occurs
- `audio:beep` - Emitted when beep sound is played

## Syscalls

The following syscalls are registered when AudioManager is provided to the Kernel:

- `audio.play(url, options?)` - Play audio from URL
- `audio.stop(audioId)` - Stop audio playback
- `audio.pause(audioId)` - Pause audio playback
- `audio.resume(audioId)` - Resume audio playback
- `audio.setVolume(audioId, volume)` - Set volume
- `audio.getVolume(audioId)` - Get volume
- `audio.beep(frequency?, duration?)` - Play beep sound

