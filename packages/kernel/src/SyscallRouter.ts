import type { SyscallRequest, SyscallResponse } from '@browser-os/schemas';
import { SyscallRequestSchema } from '@browser-os/schemas';
import type { SyscallHandler } from './types';
import { SecurityContext } from './SecurityContext';
import { PermissionManager } from './PermissionManager';

/**
 * Routes syscalls to appropriate handlers
 */
export class SyscallRouter {
  private handlers: Map<string, SyscallHandler> = new Map();
  private permissionManager: PermissionManager;

  constructor(permissionManager: PermissionManager) {
    this.permissionManager = permissionManager;
  }

  /**
   * Register a syscall handler
   */
  register(name: string, handler: SyscallHandler): void {
    this.handlers.set(name, handler);
  }

  /**
   * Handle a syscall request
   */
  async handle(request: SyscallRequest): Promise<SyscallResponse> {
    // Validate request
    const validated = SyscallRequestSchema.parse(request);

    // Get security context
    const pid = validated.pid;
    if (!pid) {
      return {
        id: validated.id,
        success: false,
        error: 'Process ID required',
      };
    }

    const context = this.permissionManager.getSecurityContext(pid);
    if (!context) {
      return {
        id: validated.id,
        success: false,
        error: `No security context for PID ${pid}`,
      };
    }

    // Check permissions
    if (!context.canSyscall(validated.syscall)) {
      return {
        id: validated.id,
        success: false,
        error: `Permission denied: ${validated.syscall}`,
      };
    }

    // Get handler
    const handler = this.handlers.get(validated.syscall);
    if (!handler) {
      return {
        id: validated.id,
        success: false,
        error: `Unknown syscall: ${validated.syscall}`,
      };
    }

    // Execute handler
    try {
      const data = await handler(validated.args, context);
      return {
        id: validated.id,
        success: true,
        data,
      };
    } catch (error) {
      return {
        id: validated.id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check if a syscall is registered
   */
  has(syscall: string): boolean {
    return this.handlers.has(syscall);
  }
}

