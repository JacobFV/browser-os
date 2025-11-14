/**
 * Path utilities for filesystem operations
 */
export class PathUtils {
  /**
   * Normalize a path (resolve . and ..)
   */
  static normalize(path: string): string {
    if (path === '' || path === '.') return '.';
    if (path === '/') return '/';

    const isAbsolute = path.startsWith('/');
    const parts = path.split('/').filter((p) => p !== '' && p !== '.');

    const resolved: string[] = [];
    for (const part of parts) {
      if (part === '..') {
        if (resolved.length > 0 && resolved[resolved.length - 1] !== '..') {
          resolved.pop();
        } else if (!isAbsolute) {
          resolved.push('..');
        }
      } else {
        resolved.push(part);
      }
    }

    const result = resolved.join('/');
    return isAbsolute ? '/' + result : result || '.';
  }

  /**
   * Join multiple path segments
   */
  static join(...paths: string[]): string {
    return this.normalize(paths.filter((p) => p).join('/'));
  }

  /**
   * Resolve a path relative to a base directory
   */
  static resolve(base: string, ...paths: string[]): string {
    const joined = this.join(base, ...paths);
    return this.normalize(joined);
  }

  /**
   * Check if a path is absolute
   */
  static isAbsolute(path: string): boolean {
    return path.startsWith('/');
  }

  /**
   * Get the directory name of a path
   */
  static dirname(path: string): string {
    const normalized = this.normalize(path);
    if (normalized === '/' || normalized === '.') return normalized;
    const isAbsolute = normalized.startsWith('/');
    const parts = normalized.split('/').filter((p) => p);
    parts.pop();
    if (parts.length === 0) {
      return isAbsolute ? '/' : '.';
    }
    return isAbsolute ? '/' + parts.join('/') : parts.join('/');
  }

  /**
   * Get the base name of a path
   */
  static basename(path: string): string {
    const normalized = this.normalize(path);
    if (normalized === '/' || normalized === '.') return normalized;
    const parts = normalized.split('/');
    return parts[parts.length - 1] || '/';
  }

  /**
   * Get the extension of a file
   */
  static extname(path: string): string {
    const basename = this.basename(path);
    const lastDot = basename.lastIndexOf('.');
    return lastDot > 0 ? basename.slice(lastDot) : '';
  }
}

