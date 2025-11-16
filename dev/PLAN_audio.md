# Audio API Implementation Plan

## Overview
Add an audio API that allows application processes to play sounds, manage audio volume, and control audio playback. This provides system sounds, notification sounds, and basic audio playback capabilities.

## Architecture

### 1. Audio Syscalls (`packages/kernel/src/syscalls/audio.ts`)
Create audio syscall handlers:
- `audio.play(url, options?)` - Play audio file, returns AudioHandle
- `audio.beep(frequency?, duration?)` - Play system beep, returns void
- `audio.stop(handle)` - Stop audio playback, returns void
- `audio.getVolume()` - Get system volume, returns number (0-1)
- `audio.setVolume(volume)` - Set system volume, returns void
- `audio.isMuted()` - Check if audio is muted, returns boolean
- `audio.setMuted(muted)` - Set mute state, returns void

### 2. Audio Manager
- Create an `AudioManager` class that manages audio playback
- Use Web Audio API or HTML5 Audio API
- Track active audio instances
- Manage system volume (if possible)
- Provide audio context management

### 3. Audio API Class (`packages/proc/src/AudioAPI.ts`)
Create an `AudioAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `play()`, `beep()`, `stop()`, `getVolume()`, `setVolume()`, `isMuted()`, `setMuted()`
- Returns `AudioHandle` objects with playback control
- Handles audio events (onEnded, onError, etc.)

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `audio: AudioAPI`
- Modify `ProcessManager.spawn()` to create an `AudioAPI` instance and add it to `osApi`

## Implementation Details

### Audio Options
```typescript
interface AudioOptions {
  volume?: number; // 0-1, overrides system volume
  loop?: boolean; // Loop playback
  onEnded?: () => void; // Callback when playback ends
  onError?: (error: Error) => void; // Callback on error
}
```

### Audio Handle
```typescript
interface AudioHandle {
  id: string;
  url: string;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getVolume(): Promise<number>;
  onEnded(callback: () => void): void;
  onError(callback: (error: Error) => void): void;
}
```

### Beep Options
```typescript
interface BeepOptions {
  frequency?: number; // Frequency in Hz (default: 440)
  duration?: number; // Duration in ms (default: 200)
  volume?: number; // Volume 0-1 (default: 0.5)
}
```

### Usage Example
```javascript
// In app code
// Play audio file
const audio = await os.audio.play('/sounds/notification.mp3', {
  volume: 0.8,
  onEnded: () => {
    console.log('Audio finished');
  }
});

// Control playback
await audio.pause();
await audio.resume();
await audio.stop();

// Set volume
await audio.setVolume(0.5);
const volume = await audio.getVolume();

// System beep
await os.audio.beep(440, 200); // A4 note, 200ms
await os.audio.beep({ frequency: 880, duration: 300, volume: 0.7 });

// System volume
const systemVolume = await os.audio.getVolume();
await os.audio.setVolume(0.75);

// Mute
const muted = await os.audio.isMuted();
await os.audio.setMuted(true);
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/audio.ts` - Audio syscall handlers
2. `packages/proc/src/AudioAPI.ts` - Audio API class
3. `packages/audio/src/AudioManager.ts` - Audio manager (new package or add to existing)

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Add AudioManager dependency, register syscalls
2. `packages/kernel/package.json` - Add audio package dependency
3. `packages/proc/src/types.ts` - Extend OSAPI interface
4. `packages/proc/src/ProcessManager.ts` - Create AudioAPI instance
5. `packages/proc/src/index.ts` - Export AudioAPI

## Considerations

- **Web Audio API**: 
  - Use Web Audio API for advanced audio control
  - Use HTML5 Audio API for simple playback
  - Handle browser compatibility
  
- **Audio Context**: 
  - Create AudioContext for Web Audio API
  - Handle audio context state (suspended/playing)
  - Resume audio context on user interaction
  
- **System Volume**: 
  - Browser doesn't expose system volume control
  - Use application-level volume control
  - Store volume preference in storage
  
- **Audio Files**: 
  - Support common formats (MP3, WAV, OGG)
  - Load audio from filesystem or URLs
  - Cache audio files for performance
  
- **Beep Generation**: 
  - Generate beep using Web Audio API oscillator
  - Provide configurable frequency and duration
  - Use for system notifications
  
- **Permissions**: 
  - Audio playback may require user interaction
  - Handle autoplay restrictions
  - Resume audio context on user gesture
  
- **Performance**: 
  - Limit concurrent audio instances
  - Clean up audio resources
  - Handle memory management

## Security

- Validate audio URLs/paths
- Limit audio file size
- Rate limit audio playback
- Check filesystem permissions for audio files
- Prevent audio spam

## Implementation Strategy

1. Create AudioManager using Web Audio API
2. Provide HTML5 Audio fallback
3. Handle audio context lifecycle
4. Implement beep generation
5. Manage audio instances
6. Clean up on process termination
7. Handle browser autoplay restrictions

