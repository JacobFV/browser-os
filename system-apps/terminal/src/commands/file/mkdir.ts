import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const mkdir: CommandHandler = async (args, flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  if (args.length === 0) {
    return ['mkdir: missing operand'];
  }
  
  const recursive = flags.has('p');
  const results: string[] = [];
  
  for (const arg of args) {
    const path = resolvePath(arg, cwd, homeDir);
    try {
      await fs.mkdir(path, { recursive });
    } catch (error) {
      results.push(`mkdir: ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return results.length > 0 ? results : [];
};

