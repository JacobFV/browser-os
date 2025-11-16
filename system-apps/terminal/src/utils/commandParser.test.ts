import { describe, it, expect } from 'vitest';
import { parseCommand } from './commandParser';

describe('commandParser', () => {
  it('should parse simple command', () => {
    const result = parseCommand('ls');
    expect(result.command).toBe('ls');
    expect(result.args).toEqual([]);
    expect(result.flags.size).toBe(0);
  });

  it('should parse command with args', () => {
    const result = parseCommand('ls /home/user');
    expect(result.command).toBe('ls');
    expect(result.args).toEqual(['/home/user']);
  });

  it('should parse command with flags', () => {
    const result = parseCommand('ls -l -a');
    expect(result.command).toBe('ls');
    expect(result.flags.has('l')).toBe(true);
    expect(result.flags.has('a')).toBe(true);
  });

  it('should parse combined flags', () => {
    const result = parseCommand('ls -la');
    expect(result.flags.has('l')).toBe(true);
    expect(result.flags.has('a')).toBe(true);
  });

  it('should parse numeric flag', () => {
    const result = parseCommand('head -10 file.txt');
    expect(result.flags.has('n')).toBe(true);
    expect(result.flagValues.get('n')).toBe('10');
  });

  it('should parse quoted arguments', () => {
    const result = parseCommand('echo "hello world"');
    expect(result.args).toEqual(['hello world']);
  });

  it('should parse single quotes', () => {
    const result = parseCommand("echo 'hello world'");
    expect(result.args).toEqual(['hello world']);
  });

  it('should handle empty command', () => {
    const result = parseCommand('');
    expect(result.command).toBe('');
    expect(result.args).toEqual([]);
  });
});

