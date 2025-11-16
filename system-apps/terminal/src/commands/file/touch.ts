import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';

export const touch: CommandHandler = async (args, _flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  if (args.length === 0) {
    return ['touch: missing file operand'];
  }
  
  const results: string[] = [];
  
  for (const arg of args) {
    const path = resolvePath(arg, cwd, homeDir);
    try {
      if (await fs.exists(path)) {
        // Update timestamp by reading and writing back
        const data = await fs.read(path);
        await fs.write(path, data);
      } else {
        // Create empty file
        await fs.write(path, new Uint8Array(0));
      }
    } catch (error) {
      results.push(`touch: ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return results.length > 0 ? results : [];
};

