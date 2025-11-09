import { vfs, FsDriver, createMemDriver } from '@browser-os/fs';

export interface FilesystemInitOptions {
  mounts?: Array<{ mountPoint: string; driver: FsDriver }>;
}

export function initFilesystem(options?: FilesystemInitOptions): void {
  // Default mount: /documents with mem driver
  const defaultMounts = [
    { mountPoint: '/documents', driver: createMemDriver() },
  ];

  const mounts = options?.mounts || defaultMounts;

  mounts.forEach(mount => {
    vfs.mount({
      mountPoint: mount.mountPoint,
      driver: mount.driver,
    });
  });
}

