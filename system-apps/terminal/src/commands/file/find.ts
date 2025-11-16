import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const find: CommandHandler = async (args, _flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  if (args.length === 0) {
    return ['find: missing search path'];
  }
  
  const searchPath = resolvePath(args[0], cwd, homeDir);
  const pattern = args[1] || '*';
  
  try {
    if (!(await fs.exists(searchPath))) {
      return [`find: ${searchPath}: No such file or directory`];
    }
    
    const results: string[] = [];
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    
    const searchRecursive = async (path: string): Promise<void> => {
      const stat = await fs.stat(path);
      const name = path.split('/').pop() || '';
      
      if (regex.test(name)) {
        results.push(path);
      }
      
      if (stat.type === 'directory') {
        const entries = await fs.readdir(path);
        for (const entry of entries) {
          const entryPath = path === '/' ? `/${entry}` : `${path}/${entry}`;
          await searchRecursive(entryPath);
        }
      }
    };
    
    await searchRecursive(searchPath);
    return results;
  } catch (error) {
    return [`find: ${error instanceof Error ? error.message : String(error)}`];
  }
};

