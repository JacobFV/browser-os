import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const head: CommandHandler = async (args, flags, flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  let numLines = 10;
  let fileIndex = 0;
  
  // Handle -n flag: can be -n10, -n 10, or -10
  if (flags.has('n')) {
    const nValue = flagValues.get('n');
    if (nValue) {
      const n = parseInt(nValue);
      if (!isNaN(n)) {
        numLines = n;
      }
    }
  }
  
  if (args.length === fileIndex) {
    return ['head: missing file operand'];
  }
  
  const results: string[] = [];
  
  for (let i = fileIndex; i < args.length; i++) {
    const path = resolvePath(args[i], cwd, homeDir);
    try {
      if (!(await fs.exists(path))) {
        results.push(`head: ${path}: No such file or directory`);
        continue;
      }
      
      const stat = await fs.stat(path);
      if (stat.type === 'directory') {
        results.push(`head: ${path}: Is a directory`);
        continue;
      }
      
      const data = await fs.read(path);
      const text = new TextDecoder().decode(data);
      const lines = text.split('\n');
      const prefix = args.length - fileIndex > 1 ? `==> ${path} <==\n` : '';
      results.push(prefix + lines.slice(0, numLines).join('\n'));
    } catch (error) {
      results.push(`head: ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return results;
};

