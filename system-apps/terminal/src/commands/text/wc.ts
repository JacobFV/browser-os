import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const wc: CommandHandler = async (args, flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  const showLines = flags.has('l') || (!flags.has('w') && !flags.has('c'));
  const showWords = flags.has('w') || (!flags.has('l') && !flags.has('c'));
  const showChars = flags.has('c');
  
  if (args.length === 0) {
    return ['wc: missing file operand'];
  }
  
  const results: string[] = [];
  let totalLines = 0;
  let totalWords = 0;
  let totalChars = 0;
  
  for (const arg of args) {
    const path = resolvePath(arg, cwd, homeDir);
    try {
      if (!(await fs.exists(path))) {
        results.push(`wc: ${path}: No such file or directory`);
        continue;
      }
      
      const stat = await fs.stat(path);
      if (stat.type === 'directory') {
        results.push(`wc: ${path}: Is a directory`);
        continue;
      }
      
      const data = await fs.read(path);
      const text = new TextDecoder().decode(data);
      const lines = text.split('\n');
      const lineCount = lines.length - (text.endsWith('\n') ? 0 : 1);
      const wordCount = text.split(/\s+/).filter(w => w).length;
      const charCount = text.length;
      
      totalLines += lineCount;
      totalWords += wordCount;
      totalChars += charCount;
      
      const parts: string[] = [];
      if (showLines) parts.push(lineCount.toString());
      if (showWords) parts.push(wordCount.toString());
      if (showChars) parts.push(charCount.toString());
      parts.push(path);
      
      results.push(parts.join(' '));
    } catch (error) {
      results.push(`wc: ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  if (args.length > 1) {
    const parts: string[] = [];
    if (showLines) parts.push(totalLines.toString());
    if (showWords) parts.push(totalWords.toString());
    if (showChars) parts.push(totalChars.toString());
    parts.push('total');
    results.push(parts.join(' '));
  }
  
  return results;
};

