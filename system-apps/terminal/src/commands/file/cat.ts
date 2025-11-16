import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const cat: CommandHandler = async (args, _flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  if (args.length === 0) {
    return ['cat: missing file operand'];
  }
  
  const results: string[] = [];
  
  for (const arg of args) {
    const path = resolvePath(arg, cwd, homeDir);
    try {
      if (!(await fs.exists(path))) {
        results.push(`cat: ${path}: No such file or directory`);
        continue;
      }
      
      const stat = await fs.stat(path);
      if (stat.type === 'directory') {
        results.push(`cat: ${path}: Is a directory`);
        continue;
      }
      
      const data = await fs.read(path);
      const text = new TextDecoder().decode(data);
      results.push(text);
    } catch (error) {
      results.push(`cat: ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return results;
};

