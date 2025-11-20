import type { EventBus } from '@browser-os/events';

/**
 * Syscall wrapper for system apps that need to access syscalls via eventBus
 * This creates a syscall interface similar to the OS API
 * 
 * Since the kernel doesn't expose syscalls via eventBus, we use a workaround:
 * - Request process info via eventBus events that the OS component handles
 * - Or access process manager directly if exposed
 */
export function createSyscallWrapper(eventBus: EventBus) {
  return async (name: string, args: Record<string, unknown> = {}): Promise<unknown> => {
    try {
      // Try to use eventBus request for process-related syscalls
      // The OS component should handle these requests
      if (name === 'proc.list') {
        const response = await eventBus.request('process-manager:list', {}, { timeout: 3000 });
        return response;
      }
      
      if (name === 'proc.get') {
        const pid = args.pid as number;
        const response = await eventBus.request('process-manager:get', { pid }, { timeout: 3000 });
        return response;
      }
      
      if (name === 'proc.kill') {
        const pid = args.pid as number;
        const signal = args.signal as 'SIGTERM' | 'SIGKILL' || 'SIGTERM';
        const response = await eventBus.request('process-manager:kill', { pid, signal }, { timeout: 3000 });
        return response;
      }
      
      // For other syscalls, try the generic request pattern
      const response = await eventBus.request('syscall:request', {
        syscall: name,
        args,
      }, { timeout: 3000 });
      return response;
    } catch (error) {
      console.error(`Syscall ${name} failed:`, error);
      throw error;
    }
  };
}

/**
 * React hook for accessing syscalls
 */
export function useSyscall(eventBus: EventBus | null) {
  if (!eventBus) {
    throw new Error('EventBus is required for syscalls');
  }
  
  return createSyscallWrapper(eventBus);
}

