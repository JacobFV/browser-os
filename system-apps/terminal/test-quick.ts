// Quick smoke test - run with: pnpm test test-quick.ts
import { describe, it, expect } from 'vitest';
import { CommandRegistry } from './commands/CommandRegistry';
import { parseCommand } from './utils/commandParser';

describe('Quick Smoke Tests', () => {
  it('should parse commands correctly', () => {
    expect(parseCommand('ls -la').command).toBe('ls');
    expect(parseCommand('cd ~').command).toBe('cd');
  });

  it('should have all expected commands registered', () => {
    const registry = new CommandRegistry();
    const commands = registry.getCommands();
    
    const expectedCommands = [
      'ls', 'cd', 'pwd', 'cat', 'touch', 'mkdir', 'rm', 'rmdir',
      'mv', 'cp', 'find', 'grep', 'head', 'tail', 'wc', 'sort',
      'uniq', 'whoami', 'date', 'ps', 'env', 'export', 'unset',
      'launch', 'run', 'help', 'echo', 'history'
    ];
    
    for (const cmd of expectedCommands) {
      expect(commands).toContain(cmd);
    }
  });

  it('should resolve aliases', () => {
    const registry = new CommandRegistry();
    expect(registry.resolveAliases('ll')).toBe('ls -l');
    expect(registry.resolveAliases('la')).toBe('ls -a');
  });
});

