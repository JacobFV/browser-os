import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const sort: CommandHandler = async (args, _flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  if (args.length === 0) {
    return ['sort: missing file operand'];
  }
  
  const results: string[] = [];
  
  for (const arg of args) {
    const path = resolvePath(arg, cwd, homeDir);
    try {
      if (!(await fs.exists(path))) {
        results.push(`sort: ${path}: No such file or directory`);
        continue;
      }
      
      const stat = await fs.stat(path);
      if (stat.type === 'directory') {
        results.push(`sort: ${path}: Is a directory`);
        continue;
      }
      
      const data = await fs.read(path);
      const text = new TextDecoder().decode(data);
      const lines = text.split('\n');
      const sorted = lines.sort();
      results.push(sorted.join('\n'));
    } catch (error) {
      results.push(`sort: ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return results;
};

