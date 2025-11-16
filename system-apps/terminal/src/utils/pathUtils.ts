/**
 * Path resolution utilities
 */

export const resolvePath = (path: string, cwd: string, home: string = '/home/user'): string => {
  // Handle ~ expansion
  if (path.startsWith('~')) {
    path = path.replace('~', home);
  }
  
  // Handle absolute paths
  if (path.startsWith('/')) {
    return normalizePath(path);
  }
  
  // Handle relative paths
  const combined = cwd === '/' ? `/${path}` : `${cwd}/${path}`;
  return normalizePath(combined);
};

export const normalizePath = (path: string): string => {
  const parts = path.split('/').filter(p => p !== '');
  const result: string[] = [];
  
  for (const part of parts) {
    if (part === '..') {
      if (result.length > 0) {
        result.pop();
      }
    } else if (part !== '.') {
      result.push(part);
    }
  }
  
  return '/' + result.join('/');
};

