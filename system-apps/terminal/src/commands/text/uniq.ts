import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const uniq: CommandHandler = async (args, _flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  if (args.length === 0) {
    return ['uniq: missing file operand'];
  }
  
  const results: string[] = [];
  
  for (const arg of args) {
    const path = resolvePath(arg, cwd, homeDir);
    try {
      if (!(await fs.exists(path))) {
        results.push(`uniq: ${path}: No such file or directory`);
        continue;
      }
      
      const stat = await fs.stat(path);
      if (stat.type === 'directory') {
        results.push(`uniq: ${path}: Is a directory`);
        continue;
      }
      
      const data = await fs.read(path);
      const text = new TextDecoder().decode(data);
      const lines = text.split('\n');
      const unique: string[] = [];
      let prev = '';
      
      for (const line of lines) {
        if (line !== prev) {
          unique.push(line);
          prev = line;
        }
      }
      
      results.push(unique.join('\n'));
    } catch (error) {
      results.push(`uniq: ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return results;
};

