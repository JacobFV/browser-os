import type { CommandHandler } from '../types';
import { env } from './env';

export const exportCmd: CommandHandler = (args, flags, flagValues, context) => {
  if (args.length === 0) {
    return env(args, flags, flagValues, context);
  }
  
  const newEnv = { ...context.env };
  
  for (const arg of args) {
    const match = arg.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      newEnv[key] = value;
    } else {
      return [`export: invalid syntax: ${arg}`];
    }
  }
  
  context.setEnv(newEnv);
  return [];
};

