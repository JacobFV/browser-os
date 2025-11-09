import { describe, it, expect, beforeEach } from 'vitest';
import { processManager, spawnApp, kill, getProcessByWindowId, getProcessByAppId } from '@browser-os/process';

describe('Process Management', () => {
  beforeEach(() => {
    // Reset process manager for each test
    processManager._reset();
  });

  describe('Process spawning', () => {
    it('should spawn an app process', () => {
      const pid = spawnApp('test-app');
      expect(pid).toBeTruthy();
      
      const proc = processManager.getProcess(pid);
      expect(proc).toBeDefined();
      expect(proc?.appId).toBe('test-app');
      expect(proc?.state).toBe('starting');
    });

    it('should spawn process with windowId', () => {
      const pid = spawnApp('test-app', undefined, 'window-123');
      const proc = processManager.getProcess(pid);
      expect(proc?.windowId).toBe('window-123');
    });
  });

  describe('Process lookup', () => {
    it('should find process by windowId', () => {
      const pid = spawnApp('test-app', undefined, 'window-123');
      const proc = getProcessByWindowId('window-123');
      expect(proc).toBeDefined();
      expect(proc?.pid).toBe(pid);
    });

    it('should find all processes by appId', () => {
      const pid1 = spawnApp('test-app');
      const pid2 = spawnApp('test-app');
      const pid3 = spawnApp('other-app');
      
      const processes = getProcessByAppId('test-app');
      expect(processes.length).toBe(2);
      expect(processes.map(p => p.pid)).toContain(pid1);
      expect(processes.map(p => p.pid)).toContain(pid2);
    });
  });

  describe('Process termination', () => {
    it('should kill a process', () => {
      const pid = spawnApp('test-app');
      expect(processManager.getProcess(pid)).toBeDefined();
      
      kill(pid);
      expect(processManager.getProcess(pid)).toBeUndefined();
    });

    it('should kill child processes when killing parent', () => {
      const parentPid = spawnApp('parent-app');
      const childPid = spawnApp('child-app', parentPid);
      
      expect(processManager.getProcess(childPid)).toBeDefined();
      
      kill(parentPid);
      
      expect(processManager.getProcess(parentPid)).toBeUndefined();
      expect(processManager.getProcess(childPid)).toBeUndefined();
    });
  });
});

