import type { CommandHandler } from '../types';

export const date: CommandHandler = (_args, _flags, _flagValues, _context) => {
  return [new Date().toLocaleString()];
};

