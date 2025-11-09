import { createId } from '@browser-os/core';
import { eventBus, ProcessEvent, ProcessState } from '@browser-os/core';

export type Pid = string;

export interface Process {
  pid: Pid;
  appId: string;
  state: ProcessState;
  startedAt: number;
  cpu?: number;
  mem?: number;
  channels: Record<string, (msg: any) => void>;
}

class ProcessManager {
  private processes: Map<Pid, Process> = new Map();

  spawn(appId: string): Pid {
    const pid = createId();
    const proc: Process = {
      pid,
      appId,
      state: 'starting',
      startedAt: Date.now(),
      channels: {},
    };
    this.processes.set(pid, proc);
    eventBus.emit('proc', { type: 'spawn', pid, appId });
    
    setTimeout(() => {
      proc.state = 'running';
    }, 100);
    
    return pid;
  }

  kill(pid: Pid): void {
    const proc = this.processes.get(pid);
    if (proc) {
      proc.state = 'stopped';
      this.processes.delete(pid);
      eventBus.emit('proc', { type: 'kill', pid });
    }
  }

  suspend(pid: Pid): void {
    const proc = this.processes.get(pid);
    if (proc && proc.state === 'running') {
      proc.state = 'suspended';
      eventBus.emit('proc', { type: 'suspend', pid });
    }
  }

  resume(pid: Pid): void {
    const proc = this.processes.get(pid);
    if (proc && proc.state === 'suspended') {
      proc.state = 'running';
      eventBus.emit('proc', { type: 'resume', pid });
    }
  }

  getProcess(pid: Pid): Process | undefined {
    return this.processes.get(pid);
  }

  getAllProcesses(): Process[] {
    return Array.from(this.processes.values());
  }

  send(pid: Pid, topic: string, msg: any): void {
    const proc = this.processes.get(pid);
    if (proc && proc.channels[topic]) {
      proc.channels[topic](msg);
    }
  }
}

export const processManager = new ProcessManager();

export function spawn(appId: string): Pid {
  return processManager.spawn(appId);
}

export function kill(pid: Pid): void {
  processManager.kill(pid);
}

export function send(pid: Pid, topic: string, msg: any): void {
  processManager.send(pid, topic, msg);
}

