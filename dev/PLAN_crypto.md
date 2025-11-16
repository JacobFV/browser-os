# Crypto API Implementation Plan

## Overview
Add a crypto API that provides cryptographic operations like random number generation, hashing, encryption, and decryption. This uses the Web Crypto API when available and provides fallbacks.

## Architecture

### 1. Crypto Syscalls (`packages/kernel/src/syscalls/crypto.ts`)
Create crypto syscall handlers:
- `crypto.randomBytes(length)` - Generate random bytes, returns Uint8Array
- `crypto.randomUUID()` - Generate UUID, returns string
- `crypto.hash(data, algorithm)` - Hash data, returns Uint8Array
- `crypto.encrypt(data, key, algorithm)` - Encrypt data, returns Uint8Array
- `crypto.decrypt(data, key, algorithm)` - Decrypt data, returns Uint8Array
- `crypto.generateKey(algorithm, extractable?)` - Generate encryption key, returns CryptoKey
- `crypto.importKey(format, keyData, algorithm)` - Import key, returns CryptoKey
- `crypto.exportKey(format, key)` - Export key, returns ArrayBuffer

### 2. Crypto Manager
- Create a `CryptoManager` class that wraps Web Crypto API
- Provide fallbacks for unavailable operations
- Handle key management
- Support common algorithms (SHA-256, AES-GCM, etc.)

### 3. Crypto API Class (`packages/proc/src/CryptoAPI.ts`)
Create a `CryptoAPI` class that:
- Wraps syscalls with an OO interface
- Provides methods: `randomBytes()`, `randomUUID()`, `hash()`, `encrypt()`, `decrypt()`, `generateKey()`, `importKey()`, `exportKey()`
- Handles different data types (string, Uint8Array, ArrayBuffer)
- Provides convenience methods for common operations

### 4. OS API Extension
- Extend `OSAPI` interface in `packages/proc/src/types.ts` to include `crypto: CryptoAPI`
- Modify `ProcessManager.spawn()` to create a `CryptoAPI` instance and add it to `osApi`

## Implementation Details

### Supported Algorithms
```typescript
type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
type EncryptionAlgorithm = 'AES-GCM' | 'AES-CBC' | 'AES-CTR';
```

### Usage Example
```javascript
// In app code
// Generate random bytes
const random = await os.crypto.randomBytes(32);
console.log('Random bytes:', random);

// Generate UUID
const uuid = await os.crypto.randomUUID();
console.log('UUID:', uuid);

// Hash data
const data = 'Hello, World!';
const hash = await os.crypto.hash(data, 'SHA-256');
console.log('Hash:', Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join(''));

// Generate encryption key
const key = await os.crypto.generateKey('AES-GCM', true);

// Encrypt data
const plaintext = new TextEncoder().encode('Secret message');
const encrypted = await os.crypto.encrypt(plaintext, key, 'AES-GCM');
console.log('Encrypted:', encrypted);

// Decrypt data
const decrypted = await os.crypto.decrypt(encrypted, key, 'AES-GCM');
const message = new TextDecoder().decode(decrypted);
console.log('Decrypted:', message);

// Import/Export keys
const exported = await os.crypto.exportKey('raw', key);
const imported = await os.crypto.importKey('raw', exported, 'AES-GCM');
```

## Files to Create/Modify

### New Files
1. `packages/kernel/src/syscalls/crypto.ts` - Crypto syscall handlers
2. `packages/proc/src/CryptoAPI.ts` - Crypto API class
3. `packages/crypto/src/CryptoManager.ts` - Crypto manager (new package or add to existing)

### Modified Files
1. `packages/kernel/src/Kernel.ts` - Add CryptoManager dependency, register syscalls
2. `packages/kernel/package.json` - Add crypto package dependency
3. `packages/proc/src/types.ts` - Extend OSAPI interface
4. `packages/proc/src/ProcessManager.ts` - Create CryptoAPI instance
5. `packages/proc/src/index.ts` - Export CryptoAPI

## Considerations

- **Web Crypto API**: 
  - Use `crypto.subtle` for most operations
  - Requires secure context (HTTPS or localhost)
  - Some operations are async
  
- **Key Management**: 
  - Keys are CryptoKey objects (can't be serialized directly)
  - Need import/export for key persistence
  - Consider key storage in secure storage
  
- **Algorithm Support**: 
  - Support common algorithms (SHA-256, AES-GCM)
  - Document supported algorithms
  - Provide fallbacks for unsupported algorithms
  
- **Performance**: 
  - Crypto operations can be CPU-intensive
  - Consider rate limiting for expensive operations
  - Use Web Workers for heavy operations if needed
  
- **Security**: 
  - Don't expose private keys
  - Validate algorithm parameters
  - Prevent timing attacks where possible
  - Use secure random number generation

## Security

- Use cryptographically secure random number generation
- Validate algorithm parameters
- Don't expose private keys
- Rate limit expensive operations
- Use secure key storage
- Document security best practices

## Implementation Strategy

1. Create CryptoManager that wraps Web Crypto API
2. Provide fallbacks for unavailable operations
3. Support common algorithms
4. Handle key import/export
5. Document security considerations
6. Add rate limiting for expensive operations

