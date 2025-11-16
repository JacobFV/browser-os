import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const grep: CommandHandler = async (args, flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  if (args.length < 1) {
    return ['grep: missing pattern'];
  }
  
  const pattern = args[0];
  const files = args.slice(1);
  
  if (files.length === 0) {
    return ['grep: missing file operand'];
  }
  
  const caseInsensitive = flags.has('i');
  const regex = new RegExp(pattern, caseInsensitive ? 'i' : '');
  const results: string[] = [];
  
  for (const file of files) {
    const path = resolvePath(file, cwd, homeDir);
    try {
      if (!(await fs.exists(path))) {
        results.push(`grep: ${path}: No such file or directory`);
        continue;
      }
      
      const stat = await fs.stat(path);
      if (stat.type === 'directory') {
        results.push(`grep: ${path}: Is a directory`);
        continue;
      }
      
      const data = await fs.read(path);
      const text = new TextDecoder().decode(data);
      const lines = text.split('\n');
      
      lines.forEach((line, index) => {
        if (regex.test(line)) {
          const prefix = files.length > 1 ? `${path}:` : '';
          results.push(`${prefix}${index + 1}:${line}`);
        }
      });
    } catch (error) {
      results.push(`grep: ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return results.length > 0 ? results : ['(no matches found)'];
};

