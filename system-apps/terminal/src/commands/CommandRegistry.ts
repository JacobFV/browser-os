import type { CommandHandler, CommandContext, ParsedCommand } from './types';
import * as fileCommands from './file';
import * as textCommands from './text';
import * as systemCommands from './system';
import * as appCommands from './app';
import * as builtinCommands from './builtin';

export class CommandRegistry {
  private handlers: Map<string, CommandHandler> = new Map();
  private aliases: Map<string, string> = new Map();

  constructor() {
    this.registerAllCommands();
    this.registerAliases();
  }

  private registerAllCommands(): void {
    // File commands
    this.register('ls', fileCommands.ls);
    this.register('cd', fileCommands.cd);
    this.register('pwd', fileCommands.pwd);
    this.register('cat', fileCommands.cat);
    this.register('touch', fileCommands.touch);
    this.register('mkdir', fileCommands.mkdir);
    this.register('rm', fileCommands.rm);
    this.register('rmdir', fileCommands.rmdir);
    this.register('mv', fileCommands.mv);
    this.register('cp', fileCommands.cp);
    this.register('find', fileCommands.find);
    this.register('grep', fileCommands.grep);

    // Text commands
    this.register('head', textCommands.head);
    this.register('tail', textCommands.tail);
    this.register('wc', textCommands.wc);
    this.register('sort', textCommands.sort);
    this.register('uniq', textCommands.uniq);

    // System commands
    this.register('whoami', systemCommands.whoami);
    this.register('date', systemCommands.date);
    this.register('ps', systemCommands.ps);
    this.register('env', systemCommands.env);
    this.register('export', systemCommands.exportCmd);
    this.register('unset', systemCommands.unset);
    this.register('git', systemCommands.git);
    this.register('pytest', systemCommands.pytest);
    this.register('npm', systemCommands.npm);
    this.register('pnpm', systemCommands.pnpm);
    this.register('yarn', systemCommands.yarn);
    this.register('make', systemCommands.make);

    // App commands
    this.register('launch', appCommands.launch);
    this.register('run', appCommands.run);

    // Builtin commands
    this.register('help', builtinCommands.help);
    this.register('echo', builtinCommands.echo);
    this.register('history', builtinCommands.history);
  }

  private registerAliases(): void {
    // Command aliases
    this.aliases.set('ll', 'ls -l');
    this.aliases.set('la', 'ls -a');
  }

  private register(name: string, handler: CommandHandler): void {
    this.handlers.set(name, handler);
  }

  private resolveAlias(cmd: string): string {
    // Check if the entire command is an alias
    const trimmed = cmd.trim();
    if (this.aliases.has(trimmed)) {
      return this.aliases.get(trimmed)!;
    }
    return cmd;
  }

  async executeCommand(
    parsedCommand: ParsedCommand,
    context: CommandContext
  ): Promise<string[]> {
    const handler = this.handlers.get(parsedCommand.command);
    if (!handler) {
      return [`Command not found: ${parsedCommand.command}. Type "help" for available commands.`];
    }

    try {
      const result = await handler(
        parsedCommand.args,
        parsedCommand.flags,
        parsedCommand.flagValues,
        context
      );
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      return [`Error: ${error instanceof Error ? error.message : String(error)}`];
    }
  }

  resolveAliases(cmd: string): string {
    return this.resolveAlias(cmd);
  }

  hasCommand(name: string): boolean {
    return this.handlers.has(name);
  }

  getCommands(): string[] {
    return Array.from(this.handlers.keys());
  }
}

