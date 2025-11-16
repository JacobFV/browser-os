import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const mv: CommandHandler = async (args, _flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  if (args.length < 2) {
    return ['mv: missing file operand'];
  }
  
  const sources = args.slice(0, -1);
  const dest = resolvePath(args[args.length - 1], cwd, homeDir);
  
  try {
    const destExists = await fs.exists(dest);
    const destIsDir = destExists ? (await fs.stat(dest)).type === 'directory' : false;
    
    if (sources.length > 1 && !destIsDir) {
      return ['mv: target is not a directory'];
    }
    
    const results: string[] = [];
    
    for (const source of sources) {
      const sourcePath = resolvePath(source, cwd, homeDir);
      try {
        if (!(await fs.exists(sourcePath))) {
          results.push(`mv: ${sourcePath}: No such file or directory`);
          continue;
        }
        
        const targetPath = destIsDir 
          ? (dest === '/' ? `/${sourcePath.split('/').pop()}` : `${dest}/${sourcePath.split('/').pop()}`)
          : dest;
        
        // Read source, write to destination, delete source
        const data = await fs.read(sourcePath);
        await fs.write(targetPath, data);
        const stat = await fs.stat(sourcePath);
        if (stat.type === 'directory') {
          await fs.rmdir(sourcePath, { recursive: true });
        } else {
          await fs.delete(sourcePath);
        }
      } catch (error) {
        results.push(`mv: ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return results.length > 0 ? results : [];
  } catch (error) {
    return [`mv: ${error instanceof Error ? error.message : String(error)}`];
  }
};

