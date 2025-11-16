/**
 * Command handler types and interfaces
 */

import type { FileSystem } from '@browser-os/fs';
import type { EventBus } from '@browser-os/events';
import type { ParsedCommand } from '../utils/commandParser';

export interface CommandContext {
  fs: FileSystem;
  cwd: string;
  env: Record<string, string>;
  eventBus?: EventBus;
  setCwd: (path: string) => void;
  setEnv: (env: Record<string, string>) => void;
  commandHistory: string[];
  homeDir: string;
}

export type CommandHandler = (
  args: string[],
  flags: Set<string>,
  flagValues: Map<string, string>,
  context: CommandContext
) => Promise<string[]> | string[];

export interface CommandInfo {
  name: string;
  description: string;
  usage?: string;
  aliases?: string[];
}

export { type ParsedCommand } from '../utils/commandParser';

