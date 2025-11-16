import type { CommandHandler } from '../types';

export const ps: CommandHandler = (_args, _flags, _flagValues, _context) => {
  // Process listing would require syscall access or EventBus
  // For now, return a placeholder message
  return ['ps: Process listing requires system access (not implemented)'];
};

