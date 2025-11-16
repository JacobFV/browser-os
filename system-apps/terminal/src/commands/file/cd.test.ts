import { describe, it, expect, beforeEach } from 'vitest';
import { FileSystem } from '@browser-os/fs';
import { EphemeralBackend } from '@browser-os/fs';
import { EventBus } from '@browser-os/events';
import { cd } from './cd';
import type { CommandContext } from '../types';

describe('cd command', () => {
  let fs: FileSystem;
  let cwd: string;
  let context: CommandContext;

  beforeEach(async () => {
    const eventBus = new EventBus();
    fs = new FileSystem({ eventBus });
    const backend = new EphemeralBackend();
    await fs.mount('/', backend);
    
    await fs.mkdir('/home/user/documents', { recursive: true });
    cwd = '/home/user';

    context = {
      fs,
      cwd,
      env: {},
      setCwd: (path: string) => { cwd = path; },
      setEnv: () => {},
      commandHistory: [],
      homeDir: '/home/user',
    };
  });

  it('should change to specified directory', async () => {
    await cd(['documents'], new Set(), new Map(), context);
    expect(cwd).toBe('/home/user/documents');
  });

  it('should change to home directory when no args', async () => {
    await cd([], new Set(), new Map(), context);
    expect(cwd).toBe('/home/user');
  });

  it('should expand ~ to home directory', async () => {
    await cd(['~'], new Set(), new Map(), context);
    expect(cwd).toBe('/home/user');
  });

  it('should return error for non-existent directory', async () => {
    const result = await cd(['nonexistent'], new Set(), new Map(), context);
    expect(result[0]).toContain('No such file or directory');
    expect(cwd).toBe('/home/user'); // Should not change
  });

  it('should return error for file (not directory)', async () => {
    await fs.write('/home/user/file.txt', new TextEncoder().encode('content'));
    const result = await cd(['file.txt'], new Set(), new Map(), context);
    expect(result[0]).toContain('Not a directory');
  });
});

