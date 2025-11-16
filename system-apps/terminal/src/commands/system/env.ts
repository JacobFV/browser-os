import type { CommandHandler } from '../types';

export const env: CommandHandler = (_args, _flags, _flagValues, context) => {
  const envVars = Object.entries(context.env).map(([key, value]) => `${key}=${value}`);
  return envVars.length > 0 ? envVars : ['(no environment variables set)'];
};

