import type { FileMetadata } from '@browser-os/schemas';
import type { CommandHandler } from '../types';
import { resolvePath } from '../../utils/pathUtils';
import { formatFileSize, formatDate } from '../../utils/formatters';

export const ls: CommandHandler = async (args, flags, _flagValues, context) => {
  const { fs, cwd, homeDir } = context;
  
  const path = args[0] ? resolvePath(args[0], cwd, homeDir) : cwd;
  const showAll = flags.has('a');
  const longFormat = flags.has('l');
  
  try {
    if (!(await fs.exists(path))) {
      return [`ls: ${path}: No such file or directory`];
    }
    
    const stat = await fs.stat(path);
    if (stat.type !== 'directory') {
      return [`ls: ${path}: Not a directory`];
    }
    
    const entries = await fs.readdir(path);
    const metadataPromises = entries.map(async (name: string) => {
      const fullPath = path === '/' ? `/${name}` : `${path}/${name}`;
      try {
        return await fs.stat(fullPath);
      } catch {
        return null;
      }
    });
    
    const metadataResults = await Promise.all(metadataPromises);
    const validEntries = metadataResults.filter((m: FileMetadata | null): m is FileMetadata => m !== null);
    
    // Filter hidden files if not -a
    const filteredEntries = showAll 
      ? validEntries 
      : validEntries.filter((e: FileMetadata) => !e.path.split('/').pop()?.startsWith('.'));
    
    if (longFormat) {
      return filteredEntries.map((e: FileMetadata) => {
        const name = e.path.split('/').pop() || '';
        const type = e.type === 'directory' ? 'd' : '-';
        const size = formatFileSize(e.size);
        const date = formatDate(e.modifiedAt);
        return `${type} ${size.padStart(10)} ${date.padEnd(20)} ${name}`;
      });
    } else {
      return filteredEntries.map((e: FileMetadata) => e.path.split('/').pop() || '');
    }
  } catch (error) {
    return [`ls: ${error instanceof Error ? error.message : String(error)}`];
  }
};

