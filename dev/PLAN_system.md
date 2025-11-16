# System Info API Implementation Plan

## Overview
Add a system info API that allows application processes to query system information like hostname, version, display info, memory, CPU, etc. This provides apps with context about the system they're running on.

## Architecture

### 1. System Syscalls (`packages/kernel/src/syscalls/system.ts`)
Create system syscall handlers:
- `system.getHostname()` - Get system hostname, returns string
- `system.getVersion()` - Get OS version, returns string
- `system.getDisplayInfo()` - Get display information, returns DisplayInfo
- `system.getMemoryInfo()` - Get memory information, returns MemoryInfo
- `system.getCpuInfo()` - Get CPU information, returns CpuInfo
- `system.getPlatform()` - Get platform info, returns PlatformInfo
- `system.getUptime()` - Get system uptime in seconds, returns number

### 2. System Info Manager
- Create a `SystemInfoManager` class that collects system information
- Use browser APIs where available (navigator, screen, performance)
- Provide fallbacks for unavailable information
- Cache system info (update periodically)

### 3. System API Class (`packages/proc/src/SystemAPI.ts`)
Create a `SystemAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `getHostname()`, `getVersion()`, `getDisplayInfo()`, `getMemoryInfo()`, `getCpuInfo()`, `getPlatform()`, `getUptime()`
- Returns typed objects for each info type

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `system: SystemAPI`
- Modify `ProcessManager.spawn()` to create a `SystemAPI` instance and add it to `osApi`

## Implementation Details

### System Info Types
```typescript
interface DisplayInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  devicePixelRatio: number;
  orientation?: 'portrait' | 'landscape';
}

interface MemoryInfo {
  total: number; // Total JS heap size (if available)
  used: number;  // Used JS heap size (if available)
  limit: number; // JS heap size limit (if available)
  available?: number; // Available memory (if available)
}

interface CpuInfo {
  cores: number; // Number of CPU cores
  architecture?: string; // CPU architecture (if available)
}

interface PlatformInfo {
  platform: 'browser' | 'node' | 'unknown';
  userAgent: string;
  language: string;
  languages: string[];
  timezone: string;
  timezoneOffset: number;
}
```

### Usage Example
```javascript
// In app code
// Get hostname
const hostname = await os.system.getHostname();
console.log('Hostname:', hostname);

// Get version
const version = await os.system.getVersion();
console.log('OS Version:', version);

// Get display info
const display = await os.system.getDisplayInfo();
console.log(`Screen: ${display.width}x${display.height}`);
console.log(`Available: ${display.availWidth}x${display.availHeight}`);
console.log(`Pixel ratio: ${display.devicePixelRatio}`);

// Get memory info
const memory = await os.system.getMemoryInfo();
if (memory.total) {
  console.log(`Memory: ${memory.used} / ${memory.total} MB`);
}

// Get CPU info
const cpu = await os.system.getCpuInfo();
console.log(`CPU cores: ${cpu.cores}`);

// Get platform info
const platform = await os.system.getPlatform();
console.log('Platform:', platform.platform);
console.log('Language:', platform.language);
console.log('Timezone:', platform.timezone);

// Get uptime
const uptime = await os.system.getUptime();
console.log(`System uptime: ${Math.floor(uptime / 60)} minutes`);
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/system.ts` - System syscall handlers
2. `packages/proc/src/SystemAPI.ts` - System API class
3. `packages/system/src/SystemInfoManager.ts` - System info manager (new package or add to existing)

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Add SystemInfoManager dependency, register syscalls
2. `packages/kernel/package.json` - Add system package dependency
3. `packages/proc/src/types.ts` - Extend OSAPI interface
4. `packages/proc/src/ProcessManager.ts` - Create SystemAPI instance
5. `packages/proc/src/index.ts` - Export SystemAPI

## Considerations

- **Browser Limitations**: 
  - Many system APIs are not available in browsers for security reasons
  - Use available browser APIs (screen, navigator, performance)
  - Provide reasonable defaults/fallbacks
  
- **Privacy**: 
  - Some system info might be considered sensitive
  - Consider permission requirements for certain info
  - Don't expose user-identifying information unnecessarily
  
- **Performance**: 
  - Cache system info (doesn't change frequently)
  - Update cache periodically or on demand
  - Don't query expensive operations repeatedly
  
- **Accuracy**: 
  - Browser APIs may not provide accurate system info
  - Document limitations and approximations
  - Use best available data

## Security

- Don't expose sensitive system information
- Consider permission requirements for detailed system info
- Validate and sanitize system info before returning
- Limit information exposure based on app permissions

## Implementation Strategy

1. Create SystemInfoManager that queries browser APIs
2. Provide fallbacks for unavailable information
3. Cache system info for performance
4. Document limitations and approximations
5. Integrate with permission system if needed

