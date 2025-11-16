import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const cd: CommandHandler = async (args, _flags, _flagValues, context) => {
  const { fs, cwd, homeDir, setCwd } = context;
  
  const targetPath = args[0] || homeDir;
  const resolvedPath = resolvePath(targetPath, cwd, homeDir);
  
  try {
    if (!(await fs.exists(resolvedPath))) {
      return [`cd: ${resolvedPath}: No such file or directory`];
    }
    
    const stat = await fs.stat(resolvedPath);
    if (stat.type !== 'directory') {
      return [`cd: ${resolvedPath}: Not a directory`];
    }
    
    setCwd(resolvedPath);
    return [];
  } catch (error) {
    return [`cd: ${error instanceof Error ? error.message : String(error)}`];
  }
};

