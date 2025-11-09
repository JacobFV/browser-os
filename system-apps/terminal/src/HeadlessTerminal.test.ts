import { describe, it, expect, beforeEach } from 'vitest';
import { HeadlessTerminal } from './HeadlessTerminal';

describe('HeadlessTerminal', () => {
  let terminal: HeadlessTerminal;

  beforeEach(() => {
    terminal = new HeadlessTerminal();
  });

  describe('Basic command execution', () => {
    it('should execute echo command', async () => {
      const result = await terminal.execute('echo hello world');
      expect(result.stdout).toBe('hello world\n');
      expect(result.exitCode).toBe(0);
    });

    it('should execute pwd command', async () => {
      const result = await terminal.execute('pwd');
      expect(result.stdout).toContain('vfs://');
      expect(result.exitCode).toBe(0);
    });

    it('should handle command not found', async () => {
      const result = await terminal.execute('nonexistentcommand');
      expect(result.stderr).toContain('Command not found');
      expect(result.exitCode).toBe(127);
    });
  });

  describe('Environment variables', () => {
    it('should set and expand environment variables', async () => {
      await terminal.execute('export TEST_VAR=hello');
      const result = await terminal.execute('echo $TEST_VAR');
      expect(result.stdout).toBe('hello\n');
    });

    it('should show all environment variables with env command', async () => {
      await terminal.execute('export VAR1=value1');
      await terminal.execute('export VAR2=value2');
      const result = await terminal.execute('env');
      expect(result.stdout).toContain('VAR1=value1');
      expect(result.stdout).toContain('VAR2=value2');
    });
  });

  describe('Command chaining', () => {
    it('should execute commands with &&', async () => {
      const result = await terminal.execute('echo first && echo second');
      expect(result.stdout).toContain('first');
      expect(result.stdout).toContain('second');
      expect(result.exitCode).toBe(0);
    });

    it('should stop on failure with &&', async () => {
      const result = await terminal.execute('nonexistent && echo should not run');
      expect(result.stderr).toContain('Command not found');
      expect(result.stdout).not.toContain('should not run');
    });

    it('should execute commands with ;', async () => {
      const result = await terminal.execute('echo first; echo second');
      expect(result.stdout).toContain('first');
      expect(result.stdout).toContain('second');
    });
  });

  describe('File operations', () => {
    it('should create and read files', async () => {
      const writeResult = await terminal.execute('echo test content > testfile.txt');
      expect(writeResult.exitCode).toBe(0);
      expect(writeResult.stderr).toBe('');
      
      // Check if file exists directly
      const cwd = terminal.getCwd();
      const filePath = cwd.endsWith('/') ? cwd + 'testfile.txt' : cwd + '/testfile.txt';
      const { vfs } = await import('@browser-os/fs');
      const content = await vfs.read(filePath, { binary: false }) as string;
      expect(content).toContain('test content');
      
      // Now test cat command
      const result = await terminal.execute('cat testfile.txt');
      if (result.stderr) {
        console.log('cat stderr:', result.stderr);
      }
      if (result.exitCode !== 0) {
        console.log('cat exit code:', result.exitCode);
      }
      console.log('cat stdout length:', result.stdout.length);
      console.log('cat stdout:', JSON.stringify(result.stdout));
      expect(result.stdout).toContain('test content');
    });

    it('should list directory contents', async () => {
      await terminal.execute('echo test > file1.txt');
      await terminal.execute('echo test > file2.txt');
      const result = await terminal.execute('ls');
      expect(result.stdout).toContain('file1.txt');
      expect(result.stdout).toContain('file2.txt');
    });
  });

  describe('History', () => {
    it('should track command history', async () => {
      await terminal.execute('echo cmd1');
      await terminal.execute('echo cmd2');
      await terminal.execute('echo cmd3');
      const history = terminal.getHistory();
      expect(history.length).toBe(3);
      expect(history[0]).toBe('echo cmd1');
      expect(history[1]).toBe('echo cmd2');
      expect(history[2]).toBe('echo cmd3');
    });

    it('should show history with history command', async () => {
      await terminal.execute('echo cmd1');
      await terminal.execute('echo cmd2');
      const result = await terminal.execute('history');
      expect(result.stdout).toContain('echo cmd1');
      expect(result.stdout).toContain('echo cmd2');
    });
  });

  describe('Aliases', () => {
    it('should create and use aliases', async () => {
      await terminal.execute('alias ll="ls -l"');
      const result = await terminal.execute('alias');
      expect(result.stdout).toContain("ll='ls -l'");
    });
  });

  describe('Working directory', () => {
    it('should change and track working directory', async () => {
      const mkdirResult = await terminal.execute('mkdir testdir');
      expect(mkdirResult.exitCode).toBe(0);
      
      const cdResult = await terminal.execute('cd testdir');
      expect(cdResult.exitCode).toBe(0);
      expect(terminal.getCwd()).toContain('testdir');
    });
  });
});
