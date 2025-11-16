# Network API Implementation Plan

## Overview
Add a network API that provides controlled network access for applications. This wraps fetch with permission checks and provides additional network utilities like request interception, rate limiting, and CORS handling.

## Architecture

### 1. Network Syscalls (`packages/kernel/src/syscalls/network.ts`)
Create network syscall handlers:
- `network.fetch(url, options)` - Make HTTP request, returns Response
- `network.request(options)` - Make HTTP request with more control, returns Response
- `network.get(url, options?)` - GET request shorthand, returns Response
- `network.post(url, body?, options?)` - POST request shorthand, returns Response
- `network.put(url, body?, options?)` - PUT request shorthand, returns Response
- `network.delete(url, options?)` - DELETE request shorthand, returns Response

### 2. Network Manager
- Create a `NetworkManager` class that manages network requests
- Wrap browser fetch API
- Add permission checks
- Provide rate limiting
- Handle CORS and security policies
- Log network requests for debugging

### 3. Network API Class (`packages/proc/src/NetworkAPI.ts`)
Create a `NetworkAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `fetch()`, `request()`, `get()`, `post()`, `put()`, `delete()`
- Returns Response objects compatible with Fetch API
- Handles errors and timeouts

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `network: NetworkAPI`
- Modify `ProcessManager.spawn()` to create a `NetworkAPI` instance and add it to `osApi`

## Implementation Details

### Network Options
```typescript
interface NetworkOptions extends RequestInit {
  timeout?: number; // Request timeout in ms
  retries?: number; // Number of retries on failure
  retryDelay?: number; // Delay between retries in ms
  followRedirects?: boolean; // Follow redirects (default: true)
  maxRedirects?: number; // Maximum redirects to follow
}
```

### Response Object
- Compatible with Fetch API Response
- Additional properties: `requestTime`, `retryCount`

### Usage Example
```javascript
// In app code
// Simple GET request
const response = await os.network.get('https://api.example.com/data');
const data = await response.json();

// POST request
const response = await os.network.post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
}, {
  headers: {
    'Content-Type': 'application/json'
  }
});

// Full fetch with options
const response = await os.network.fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token'
  },
  timeout: 5000,
  retries: 3
});

// PUT request
await os.network.put('https://api.example.com/users/123', {
  name: 'Jane Doe'
});

// DELETE request
await os.network.delete('https://api.example.com/users/123');
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/network.ts` - Network syscall handlers
2. `packages/proc/src/NetworkAPI.ts` - Network API class
3. `packages/network/src/NetworkManager.ts` - Network manager (new package or add to existing)

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Add NetworkManager dependency, register syscalls
2. `packages/kernel/package.json` - Add network package dependency
3. `packages/proc/src/types.ts` - Extend OSAPI interface
4. `packages/proc/src/ProcessManager.ts` - Create NetworkAPI instance
5. `packages/proc/src/index.ts` - Export NetworkAPI

## Considerations

- **Permissions**: 
  - Network access should require permission
  - Check app manifest for network permissions
  - Allow/deny specific domains or patterns
  - Default: no network access unless granted
  
- **CORS**: 
  - Browser CORS policies still apply
  - May need proxy server for cross-origin requests
  - Document CORS limitations
  
- **Security**: 
  - Validate URLs (prevent SSRF attacks)
  - Sanitize request headers
  - Limit request size
  - Rate limiting per app
  
- **Proxy**: 
  - Consider using existing proxy server (`packages/server/src/routes/proxy.ts`)
  - Route requests through proxy for CORS handling
  - Log proxy requests
  
- **Rate Limiting**: 
  - Limit requests per app (e.g., 100 requests/minute)
  - Track request rate per app
  - Return error when rate limit exceeded
  
- **Timeouts**: 
  - Default timeout (e.g., 30 seconds)
  - Configurable per request
  - Cancel requests on timeout
  
- **Retries**: 
  - Automatic retry on failure
  - Exponential backoff
  - Configurable retry count

## Security

- Require network permission in app manifest
- Validate URLs (whitelist/blacklist domains)
- Prevent SSRF attacks (block localhost/internal IPs)
- Rate limit requests per app
- Sanitize request/response data
- Log network requests for auditing

## Implementation Strategy

1. Create NetworkManager that wraps fetch API
2. Add permission checks before requests
3. Integrate with proxy server for CORS
4. Add rate limiting and timeout handling
5. Provide retry logic with exponential backoff
6. Log requests for debugging and auditing

