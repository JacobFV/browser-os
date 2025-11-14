import type { Permission } from '@browser-os/schemas';
import { SecurityContext } from './SecurityContext';

/**
 * Manages permissions for processes
 */
export class PermissionManager {
  private permissions: Map<number, Permission> = new Map();

  /**
   * Set permissions for a process
   */
  setPermission(pid: number, permission: Permission): void {
    this.permissions.set(pid, permission);
  }

  /**
   * Get permissions for a process
   */
  getPermission(pid: number): Permission | null {
    return this.permissions.get(pid) ?? null;
  }

  /**
   * Get security context for a process
   */
  getSecurityContext(pid: number): SecurityContext | null {
    const permission = this.getPermission(pid);
    if (!permission) return null;
    return new SecurityContext(pid, permission);
  }

  /**
   * Remove permissions for a process
   */
  removePermission(pid: number): void {
    this.permissions.delete(pid);
  }

  /**
   * Grant a syscall permission to a process
   */
  grantSyscall(pid: number, syscall: string): void {
    const permission = this.permissions.get(pid);
    if (permission) {
      if (!permission.allowedSyscalls.includes(syscall)) {
        permission.allowedSyscalls.push(syscall);
      }
    }
  }

  /**
   * Revoke a syscall permission from a process
   */
  revokeSyscall(pid: number, syscall: string): void {
    const permission = this.permissions.get(pid);
    if (permission) {
      permission.allowedSyscalls = permission.allowedSyscalls.filter((s) => s !== syscall);
    }
  }

  /**
   * Grant filesystem access to a process
   */
  grantFSAccess(pid: number, path: string): void {
    const permission = this.permissions.get(pid);
    if (permission) {
      if (!permission.fsAccess.includes(path)) {
        permission.fsAccess.push(path);
      }
    }
  }

  /**
   * Revoke filesystem access from a process
   */
  revokeFSAccess(pid: number, path: string): void {
    const permission = this.permissions.get(pid);
    if (permission) {
      permission.fsAccess = permission.fsAccess.filter((p) => p !== path);
    }
  }
}

