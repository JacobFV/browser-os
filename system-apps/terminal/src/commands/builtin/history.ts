import type { CommandHandler } from '../types';

export const history: CommandHandler = (_args, _flags, _flagValues, context) => {
  if (context.commandHistory.length === 0) {
    return ['No commands in history.'];
  }
  return context.commandHistory.map((cmd, idx) => `${idx + 1}. ${cmd}`);
};

