import { describe, it, expect, beforeEach } from 'vitest';
import { FileSystem } from '@browser-os/fs';
import { EphemeralBackend } from '@browser-os/fs';
import { EventBus } from '@browser-os/events';
import { ls } from './ls';
import type { CommandContext } from '../types';

describe('ls command', () => {
  let fs: FileSystem;
  let context: CommandContext;

  beforeEach(async () => {
    const eventBus = new EventBus();
    fs = new FileSystem({ eventBus });
    const backend = new EphemeralBackend();
    await fs.mount('/', backend);
    
    // Create test files
    await fs.write('/file1.txt', new TextEncoder().encode('content1'));
    await fs.write('/file2.txt', new TextEncoder().encode('content2'));
    await fs.mkdir('/dir1');
    await fs.write('/dir1/file3.txt', new TextEncoder().encode('content3'));

    context = {
      fs,
      cwd: '/',
      env: {},
      setCwd: () => {},
      setEnv: () => {},
      commandHistory: [],
      homeDir: '/home/user',
    };
  });

  it('should list files in current directory', async () => {
    const result = await ls([], new Set(), new Map(), context);
    expect(result.length).toBeGreaterThan(0);
    expect(result.some(r => r.includes('file1.txt'))).toBe(true);
  });

  it('should list files in specified directory', async () => {
    const result = await ls(['dir1'], new Set(), new Map(), context);
    expect(result.some(r => r.includes('file3.txt'))).toBe(true);
  });

  it('should show hidden files with -a flag', async () => {
    await fs.write('/.hidden', new TextEncoder().encode('hidden'));
    const result = await ls([], new Set(['a']), new Map(), context);
    expect(result.some(r => r.includes('.hidden'))).toBe(true);
  });

  it('should show long format with -l flag', async () => {
    const result = await ls([], new Set(['l']), new Map(), context);
    expect(result.length).toBeGreaterThan(0);
    // Long format should include file size and date
    expect(result[0].split(' ').length).toBeGreaterThan(2);
  });

  it('should return error for non-existent directory', async () => {
    const result = await ls(['nonexistent'], new Set(), new Map(), context);
    expect(result[0]).toContain('No such file or directory');
  });
});

