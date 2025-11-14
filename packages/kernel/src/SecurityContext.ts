import type { Permission } from '@browser-os/schemas';

/**
 * Security context for a process
 */
export class SecurityContext {
  constructor(
    public pid: number,
    public permissions: Permission
  ) {}

  /**
   * Check if process has permission for a syscall
   */
  canSyscall(syscall: string): boolean {
    // Check denied syscalls first
    if (this.permissions.deniedSyscalls?.includes(syscall)) {
      return false;
    }

    // Check allowed syscalls
    if (this.permissions.allowedSyscalls.includes(syscall)) {
      return true;
    }

    // Default deny
    return false;
  }

  /**
   * Check if process can access a filesystem path
   */
  canAccessPath(path: string, operation: 'read' | 'write' | 'execute'): boolean {
    // Check if any allowed path matches
    for (const allowedPath of this.permissions.fsAccess) {
      if (this.pathMatches(path, allowedPath)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a path matches a pattern (supports globs)
   */
  private pathMatches(path: string, pattern: string): boolean {
    // Simple glob matching
    const regex = new RegExp(
      '^' + pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$'
    );
    return regex.test(path);
  }
}

