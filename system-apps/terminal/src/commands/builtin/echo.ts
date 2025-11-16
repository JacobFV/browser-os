import type { CommandHandler } from '../types';

export const echo: CommandHandler = (args, _flags, _flagValues, _context) => {
  return [args.join(' ') || ''];
};

