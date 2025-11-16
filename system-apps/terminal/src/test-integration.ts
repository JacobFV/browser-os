import { describe, it, expect, beforeEach } from 'vitest';
import { CommandRegistry } from './commands/CommandRegistry';
import { parseCommand } from './utils/commandParser';
import { FileSystem } from '@browser-os/fs';
import { EphemeralBackend } from '@browser-os/fs';
import { EventBus } from '@browser-os/events';
import type { CommandContext } from './commands/types';

describe('Terminal Integration Tests', () => {
  let registry: CommandRegistry;
  let context: CommandContext;
  let fs: FileSystem;
  let cwd: string;
  let env: Record<string, string>;

  beforeEach(async () => {
    registry = new CommandRegistry();
    const eventBus = new EventBus();
    fs = new FileSystem({ eventBus });
    const backend = new EphemeralBackend();
    await fs.mount('/', backend);
    await fs.mkdir('/home/user/documents', { recursive: true });
    
    cwd = '/home/user';
    env = {};

    context = {
      fs,
      cwd,
      env,
      setCwd: (path: string) => { cwd = path; },
      setEnv: (newEnv: Record<string, string>) => { env = newEnv; },
      commandHistory: [],
      homeDir: '/home/user',
    };
  });

  it('should handle complete workflow: create, write, read, delete', async () => {
    // Create directory
    let parsed = parseCommand('mkdir test-workflow');
    await registry.executeCommand(parsed, context);
    expect(await fs.exists('/home/user/test-workflow')).toBe(true);

    // Change directory
    parsed = parseCommand('cd test-workflow');
    await registry.executeCommand(parsed, context);
    expect(cwd).toBe('/home/user/test-workflow');

    // Create file
    parsed = parseCommand('touch test.txt');
    await registry.executeCommand(parsed, context);
    expect(await fs.exists('/home/user/test-workflow/test.txt')).toBe(true);

    // Write content (using echo would require different approach)
    await fs.write('/home/user/test-workflow/test.txt', 
      new TextEncoder().encode('Hello World\nLine 2\nLine 3'));

    // Read file
    parsed = parseCommand('cat test.txt');
    const result = await registry.executeCommand(parsed, context);
    expect(result.join('\n')).toContain('Hello World');

    // List files
    parsed = parseCommand('ls');
    const lsResult = await registry.executeCommand(parsed, context);
    expect(lsResult.some(r => r.includes('test.txt'))).toBe(true);

    // Word count
    parsed = parseCommand('wc test.txt');
    const wcResult = await registry.executeCommand(parsed, context);
    expect(wcResult[0]).toContain('3'); // 3 lines

    // Go back and remove
    parsed = parseCommand('cd ..');
    await registry.executeCommand(parsed, context);
    
    parsed = parseCommand('rm -r test-workflow');
    await registry.executeCommand(parsed, context);
    expect(await fs.exists('/home/user/test-workflow')).toBe(false);
  });

  it('should handle environment variables', async () => {
    let parsed = parseCommand('export TEST_VAR=test_value');
    await registry.executeCommand(parsed, context);
    expect(env.TEST_VAR).toBe('test_value');

    parsed = parseCommand('env');
    const envResult = await registry.executeCommand(parsed, context);
    expect(envResult.some(r => r.includes('TEST_VAR=test_value'))).toBe(true);

    parsed = parseCommand('unset TEST_VAR');
    await registry.executeCommand(parsed, context);
    expect(env.TEST_VAR).toBeUndefined();
  });

  it('should handle aliases', async () => {
    const resolved = registry.resolveAliases('ll');
    expect(resolved).toBe('ls -l');
    
    const parsed = parseCommand(resolved);
    const result = await registry.executeCommand(parsed, context);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle path resolution', async () => {
    await fs.mkdir('/home/user/nested/deep', { recursive: true });
    
    let parsed = parseCommand('cd nested/deep');
    await registry.executeCommand(parsed, context);
    expect(cwd).toBe('/home/user/nested/deep');

    parsed = parseCommand('cd ../..');
    await registry.executeCommand(parsed, context);
    expect(cwd).toBe('/home/user');

    parsed = parseCommand('cd ~');
    await registry.executeCommand(parsed, context);
    expect(cwd).toBe('/home/user');
  });
});

