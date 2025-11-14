import type { FileSystem } from '@browser-os/fs';
import type { SyscallHandler } from '../types';

export function createFSSyscalls(fs: FileSystem): Record<string, SyscallHandler> {
  return {
    'fs.read': async (args, context) => {
      const path = args.path as string;
      if (!path) throw new Error('Path required');

      if (!context.canAccessPath(path, 'read')) {
        throw new Error(`Permission denied: cannot read ${path}`);
      }

      const data = await fs.read(path);
      return Array.from(data); // Convert to array for JSON serialization
    },

    'fs.write': async (args, context) => {
      const path = args.path as string;
      const data = args.data as number[] | Uint8Array;
      if (!path) throw new Error('Path required');
      if (!data) throw new Error('Data required');

      if (!context.canAccessPath(path, 'write')) {
        throw new Error(`Permission denied: cannot write ${path}`);
      }

      const bytes = Array.isArray(data) ? new Uint8Array(data) : data;
      await fs.write(path, bytes, { create: args.create as boolean | undefined });
      return null;
    },

    'fs.delete': async (args, context) => {
      const path = args.path as string;
      if (!path) throw new Error('Path required');

      if (!context.canAccessPath(path, 'write')) {
        throw new Error(`Permission denied: cannot delete ${path}`);
      }

      await fs.delete(path);
      return null;
    },

    'fs.mkdir': async (args, context) => {
      const path = args.path as string;
      if (!path) throw new Error('Path required');

      if (!context.canAccessPath(path, 'write')) {
        throw new Error(`Permission denied: cannot create directory ${path}`);
      }

      await fs.mkdir(path, { recursive: args.recursive as boolean | undefined });
      return null;
    },

    'fs.rmdir': async (args, context) => {
      const path = args.path as string;
      if (!path) throw new Error('Path required');

      if (!context.canAccessPath(path, 'write')) {
        throw new Error(`Permission denied: cannot remove directory ${path}`);
      }

      await fs.rmdir(path, { recursive: args.recursive as boolean | undefined });
      return null;
    },

    'fs.readdir': async (args, context) => {
      const path = args.path as string;
      if (!path) throw new Error('Path required');

      if (!context.canAccessPath(path, 'read')) {
        throw new Error(`Permission denied: cannot read directory ${path}`);
      }

      return await fs.readdir(path);
    },

    'fs.stat': async (args, context) => {
      const path = args.path as string;
      if (!path) throw new Error('Path required');

      if (!context.canAccessPath(path, 'read')) {
        throw new Error(`Permission denied: cannot stat ${path}`);
      }

      return await fs.stat(path);
    },

    'fs.exists': async (args, context) => {
      const path = args.path as string;
      if (!path) throw new Error('Path required');

      if (!context.canAccessPath(path, 'read')) {
        throw new Error(`Permission denied: cannot check existence of ${path}`);
      }

      return await fs.exists(path);
    },
  };
}

