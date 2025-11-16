import { describe, it, expect, beforeEach } from 'vitest';
import { CommandRegistry } from './CommandRegistry';
import { parseCommand } from '../utils/commandParser';
import { FileSystem } from '@browser-os/fs';
import { EphemeralBackend } from '@browser-os/fs';
import { EventBus } from '@browser-os/events';
import type { CommandContext } from './types';

describe('CommandRegistry', () => {
  let registry: CommandRegistry;
  let context: CommandContext;
  let fs: FileSystem;

  beforeEach(async () => {
    registry = new CommandRegistry();
    const eventBus = new EventBus();
    fs = new FileSystem({ eventBus });
    const backend = new EphemeralBackend();
    await fs.mount('/', backend);
    await fs.mkdir('/home/user', { recursive: true });

    context = {
      fs,
      cwd: '/home/user',
      env: {},
      setCwd: () => {},
      setEnv: () => {},
      commandHistory: [],
      homeDir: '/home/user',
    };
  });

  it('should register all commands', () => {
    const commands = registry.getCommands();
    expect(commands).toContain('ls');
    expect(commands).toContain('cd');
    expect(commands).toContain('pwd');
    expect(commands).toContain('cat');
    expect(commands).toContain('help');
    expect(commands).toContain('echo');
  });

  it('should execute registered command', async () => {
    const parsed = parseCommand('pwd');
    const result = await registry.executeCommand(parsed, context);
    expect(result[0]).toBe('/home/user');
  });

  it('should return error for unknown command', async () => {
    const parsed = parseCommand('unknowncommand');
    const result = await registry.executeCommand(parsed, context);
    expect(result[0]).toContain('Command not found');
  });

  it('should resolve aliases', () => {
    expect(registry.resolveAliases('ll')).toBe('ls -l');
    expect(registry.resolveAliases('la')).toBe('ls -a');
    expect(registry.resolveAliases('normal')).toBe('normal');
  });

  it('should handle command errors gracefully', async () => {
    const parsed = parseCommand('cd nonexistent');
    const result = await registry.executeCommand(parsed, context);
    expect(result[0]).toContain('No such file or directory');
  });
});

