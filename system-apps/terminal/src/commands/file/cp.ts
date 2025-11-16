import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const cp: CommandHandler = async (args, flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  if (args.length < 2) {
    return ['cp: missing file operand'];
  }
  
  const recursive = flags.has('r');
  const sources = args.slice(0, -1);
  const dest = resolvePath(args[args.length - 1], cwd, homeDir);
  
  try {
    const destExists = await fs.exists(dest);
    const destIsDir = destExists ? (await fs.stat(dest)).type === 'directory' : false;
    
    if (sources.length > 1 && !destIsDir) {
      return ['cp: target is not a directory'];
    }
    
    const results: string[] = [];
    
    const copyRecursive = async (sourcePath: string, targetPath: string): Promise<void> => {
      const stat = await fs.stat(sourcePath);
      if (stat.type === 'directory') {
        if (!recursive) {
          throw new Error('Is a directory (not copied)');
        }
        await fs.mkdir(targetPath, { recursive: true });
        const entries = await fs.readdir(sourcePath);
        for (const entry of entries) {
          const sourceEntry = sourcePath === '/' ? `/${entry}` : `${sourcePath}/${entry}`;
          const targetEntry = targetPath === '/' ? `/${entry}` : `${targetPath}/${entry}`;
          await copyRecursive(sourceEntry, targetEntry);
        }
      } else {
        const data = await fs.read(sourcePath);
        await fs.write(targetPath, data);
      }
    };
    
    for (const source of sources) {
      const sourcePath = resolvePath(source, cwd, homeDir);
      try {
        if (!(await fs.exists(sourcePath))) {
          results.push(`cp: ${sourcePath}: No such file or directory`);
          continue;
        }
        
        const targetPath = destIsDir 
          ? (dest === '/' ? `/${sourcePath.split('/').pop()}` : `${dest}/${sourcePath.split('/').pop()}`)
          : dest;
        
        await copyRecursive(sourcePath, targetPath);
      } catch (error) {
        results.push(`cp: ${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return results.length > 0 ? results : [];
  } catch (error) {
    return [`cp: ${error instanceof Error ? error.message : String(error)}`];
  }
};

