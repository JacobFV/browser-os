import type { CommandHandler } from '../types';

export const whoami: CommandHandler = (_args, _flags, _flagValues, _context) => {
  return ['user'];
};

