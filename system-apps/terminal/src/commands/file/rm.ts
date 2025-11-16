import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const rm: CommandHandler = async (args, flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  if (args.length === 0) {
    return ['rm: missing operand'];
  }
  
  const recursive = flags.has('r');
  const results: string[] = [];
  
  for (const arg of args) {
    const path = resolvePath(arg, cwd, homeDir);
    try {
      if (!(await fs.exists(path))) {
        results.push(`rm: ${path}: No such file or directory`);
        continue;
      }
      
      const stat = await fs.stat(path);
      if (stat.type === 'directory') {
        if (recursive) {
          await fs.rmdir(path, { recursive: true });
        } else {
          results.push(`rm: ${path}: Is a directory`);
        }
      } else {
        await fs.delete(path);
      }
    } catch (error) {
      results.push(`rm: ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return results.length > 0 ? results : [];
};

