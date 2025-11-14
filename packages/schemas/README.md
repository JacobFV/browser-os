# @browser-os/schemas

Zod schemas and TypeScript types for browser-os core packages.

## Overview

This package provides shared type definitions and validation schemas used across all browser-os packages. All schemas use Zod for runtime validation.

## Exports

- **Syscall schemas**: `SyscallRequest`, `SyscallResponse`
- **Process schemas**: `Process`, `ProcessStatus`
- **Filesystem schemas**: `FileMetadata`, `MountPoint`, `BackendType`
- **App schemas**: `AppManifest`, `AppRegistryEntry`
- **Event schemas**: `Event`
- **Permission schemas**: `Permission`
- **Config schemas**: `SystemConfig`, `User`

## Usage

```typescript
import { ProcessSchema, AppManifestSchema } from '@browser-os/schemas';

const process = ProcessSchema.parse(data);
const manifest = AppManifestSchema.parse(appData);
```

