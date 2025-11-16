import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const rmdir: CommandHandler = async (args, _flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  if (args.length === 0) {
    return ['rmdir: missing operand'];
  }
  
  const results: string[] = [];
  
  for (const arg of args) {
    const path = resolvePath(arg, cwd, homeDir);
    try {
      await fs.rmdir(path);
    } catch (error) {
      results.push(`rmdir: ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return results.length > 0 ? results : [];
};

