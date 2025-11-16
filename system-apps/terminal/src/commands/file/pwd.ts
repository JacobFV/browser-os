import type { CommandHandler } from '../types';

export const pwd: CommandHandler = (_args, _flags, _flagValues, context) => {
  return [context.cwd];
};

