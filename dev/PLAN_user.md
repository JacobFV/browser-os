# User API Implementation Plan

## Overview
Add a user API that provides information about the current user, user-specific directories, and user configuration. This enables apps to access user home directory, config directory, and other user-specific paths.

## Architecture

### 1. User Syscalls (`packages/kernel/src/syscalls/user.ts`)
Create user syscall handlers:
- `user.getCurrent()` - Get current user info, returns UserInfo
- `user.getHomeDir()` - Get user home directory, returns string
- `user.getConfigDir()` - Get user config directory, returns string
- `user.getDataDir()` - Get user data directory, returns string
- `user.getCacheDir()` - Get user cache directory, returns string
- `user.getDesktopDir()` - Get user desktop directory, returns string
- `user.getDocumentsDir()` - Get user documents directory, returns string
- `user.getDownloadsDir()` - Get user downloads directory, returns string

### 2. User Manager Integration
- Use existing system configuration from `/etc/config.json`
- Get user info from SystemConfig
- Provide user-specific directory paths
- Handle user switching (if supported)

### 3. User API Class (`packages/proc/src/UserAPI.ts`)
Create a `UserAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `getCurrent()`, `getHomeDir()`, `getConfigDir()`, `getDataDir()`, `getCacheDir()`, `getDesktopDir()`, `getDocumentsDir()`, `getDownloadsDir()`
- Returns `UserInfo` objects and directory paths

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `user: UserAPI`
- Modify `ProcessManager.spawn()` to create a `UserAPI` instance and add it to `osApi`

## Implementation Details

### User Info
```typescript
interface UserInfo {
  id: string;
  username: string;
  homeDir: string;
  displayName?: string;
  email?: string;
}
```

### Directory Structure
- Home: `/home/${username}` (e.g., `/home/user`)
- Config: `/home/${username}/.config` (e.g., `/home/user/.config`)
- Data: `/home/${username}/.local/share` (e.g., `/home/user/.local/share`)
- Cache: `/home/${username}/.cache` (e.g., `/home/user/.cache`)
- Desktop: `/home/${username}/Desktop`
- Documents: `/home/${username}/Documents`
- Downloads: `/home/${username}/Downloads`

### Usage Example
```javascript
// In app code
// Get current user
const user = await os.user.getCurrent();
console.log('Current user:', user.username);
console.log('User ID:', user.id);

// Get user directories
const homeDir = await os.user.getHomeDir();
console.log('Home directory:', homeDir); // /home/user

const configDir = await os.user.getConfigDir();
console.log('Config directory:', configDir); // /home/user/.config

const dataDir = await os.user.getDataDir();
console.log('Data directory:', dataDir); // /home/user/.local/share

const cacheDir = await os.user.getCacheDir();
console.log('Cache directory:', cacheDir); // /home/user/.cache

const desktopDir = await os.user.getDesktopDir();
console.log('Desktop directory:', desktopDir); // /home/user/Desktop

const documentsDir = await os.user.getDocumentsDir();
console.log('Documents directory:', documentsDir); // /home/user/Documents

const downloadsDir = await os.user.getDownloadsDir();
console.log('Downloads directory:', downloadsDir); // /home/user/Downloads

// Use directories for file operations
const configPath = `${configDir}/myapp/config.json`;
await os.fs.write(configPath, configData);
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/user.ts` - User syscall handlers
2. `packages/proc/src/UserAPI.ts` - User API class

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Register user syscalls (no new dependency needed, uses SystemConfig)
2. `packages/proc/src/types.ts` - Extend OSAPI interface
3. `packages/proc/src/ProcessManager.ts` - Create UserAPI instance
4. `packages/proc/src/index.ts` - Export UserAPI

## Considerations

- **System Config**: 
  - Get user info from `/etc/config.json` SystemConfig
  - Use `defaultUser` from config
  - Support multiple users if configured
  
- **Directory Creation**: 
  - Ensure user directories exist
  - Create directories on first access if needed
  - Use FileSystem to create directories
  
- **User Switching**: 
  - Currently single user system
  - Future: support user switching
  - Track current user per process
  
- **Path Consistency**: 
  - Use consistent path format
  - Follow Unix-style directory structure
  - Document directory purposes
  
- **Permissions**: 
  - User directories are accessible to user's processes
  - Respect filesystem permissions
  - Isolate user data

## Security

- Validate user IDs
- Ensure processes can only access their user's directories
- Prevent path traversal
- Check filesystem permissions
- Isolate user data

## Implementation Strategy

1. Read user info from SystemConfig
2. Provide user directory paths based on username
3. Ensure directories exist (create if needed)
4. Integrate with FileSystem
5. Support future user switching
6. Document directory structure and purposes

