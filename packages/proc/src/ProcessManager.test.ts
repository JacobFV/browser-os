import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '@browser-os/events';
import { FileSystem } from '@browser-os/fs';
import { EphemeralBackend } from '@browser-os/fs';
import { ProcessManager } from './ProcessManager';

describe('ProcessManager', () => {
  let eventBus: EventBus;
  let fs: FileSystem;
  let procManager: ProcessManager;
  let syscallHandler: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    eventBus = new EventBus();
    fs = new FileSystem({ eventBus });
    const backend = new EphemeralBackend();
    await fs.mount('/', backend);

    syscallHandler = vi.fn().mockResolvedValue({ success: true });

    procManager = new ProcessManager({
      eventBus,
      fs,
      syscallHandler: async (pid, syscall, args) => {
        return syscallHandler(pid, syscall, args);
      },
    });
  });

  describe('spawn', () => {
    it('should spawn a process', async () => {
      // Create a test app
      const appCode = `
        console.log('Hello from app');
      `;
      await fs.write('/bin/test-app.js', new TextEncoder().encode(appCode));

      const process = await procManager.spawn('test-app', ['arg1']);

      expect(process).toBeDefined();
      expect(process.pid).toBeGreaterThan(0);
      expect(process.name).toBe('test-app');
      expect(process.status).toBe('running');
    });

    it('should set process options', async () => {
      const appCode = `console.log('test');`;
      await fs.write('/bin/test-app.js', new TextEncoder().encode(appCode));

      const process = await procManager.spawn('test-app', [], {
        cwd: '/home/user',
        env: { TEST: 'value' },
        ppid: 1,
      });

      expect(process.cwd).toBe('/home/user');
      expect(process.env.TEST).toBe('value');
      expect(process.ppid).toBe(1);
    });

    it('should create IPC channel for process', async () => {
      const appCode = `console.log('test');`;
      await fs.write('/bin/test-app.js', new TextEncoder().encode(appCode));

      const process = await procManager.spawn('test-app');
      expect(process.channel).toBeDefined();
    });

    it('should throw error if app not found', async () => {
      await expect(procManager.spawn('nonexistent-app')).rejects.toThrow('Failed to load app');
    });
  });

  describe('kill', () => {
    it('should kill a process', async () => {
      const appCode = `console.log('test');`;
      await fs.write('/bin/test-app.js', new TextEncoder().encode(appCode));

      const process = await procManager.spawn('test-app');
      await procManager.kill(process.pid);

      expect(procManager.get(process.pid)).toBeNull();
    });

    it('should throw error if process not found', async () => {
      await expect(procManager.kill(99999)).rejects.toThrow('Process 99999 not found');
    });
  });

  describe('get', () => {
    it('should get process by PID', async () => {
      const appCode = `console.log('test');`;
      await fs.write('/bin/test-app.js', new TextEncoder().encode(appCode));

      const process = await procManager.spawn('test-app');
      const found = procManager.get(process.pid);

      expect(found).toBeDefined();
      expect(found?.pid).toBe(process.pid);
    });

    it('should return null for non-existent process', () => {
      expect(procManager.get(99999)).toBeNull();
    });
  });

  describe('list', () => {
    it('should list all processes', async () => {
      const appCode = `console.log('test');`;
      await fs.write('/bin/test-app.js', new TextEncoder().encode(appCode));

      const process1 = await procManager.spawn('test-app');
      const process2 = await procManager.spawn('test-app');

      const processes = procManager.list();
      expect(processes.length).toBeGreaterThanOrEqual(2);
      expect(processes.some((p) => p.pid === process1.pid)).toBe(true);
      expect(processes.some((p) => p.pid === process2.pid)).toBe(true);
    });
  });

  describe('getChannel', () => {
    it('should get IPC channel for process', async () => {
      const appCode = `console.log('test');`;
      await fs.write('/bin/test-app.js', new TextEncoder().encode(appCode));

      const process = await procManager.spawn('test-app');
      const channel = procManager.getChannel(process.pid);

      expect(channel).toBeDefined();
      expect(channel).toBe(process.channel);
    });

    it('should return null for non-existent process', () => {
      expect(procManager.getChannel(99999)).toBeNull();
    });
  });
});

