import type { CommandHandler } from '../types';

export const unset: CommandHandler = (args, _flags, _flagValues, context) => {
  if (args.length === 0) {
    return ['unset: missing variable name'];
  }
  
  const newEnv = { ...context.env };
  for (const arg of args) {
    delete newEnv[arg];
  }
  
  context.setEnv(newEnv);
  return [];
};

