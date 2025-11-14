import type { SyscallRequest, SyscallResponse } from '@browser-os/schemas';
import type { SecurityContext } from './SecurityContext';

export type SyscallHandler = (
  args: Record<string, unknown>,
  context: SecurityContext
) => Promise<unknown>;

