import { describe, it, expect } from 'vitest';

describe('Package Exports', () => {
  it('should export Taskbar from @browser-os/taskbar', async () => {
    const taskbar = await import('@browser-os/taskbar');
    expect(taskbar.Taskbar).toBeDefined();
    expect(typeof taskbar.Taskbar).toBe('function');
  });
  
  it('should export Desktop from @browser-os/desktop', async () => {
    const desktop = await import('@browser-os/desktop');
    expect(desktop.Desktop).toBeDefined();
    expect(typeof desktop.Desktop).toBe('function');
  });
  
  it('should export Shell from @browser-os/shell', async () => {
    const shell = await import('@browser-os/shell');
    expect(shell.Shell).toBeDefined();
    expect(typeof shell.Shell).toBe('function');
  });
});

