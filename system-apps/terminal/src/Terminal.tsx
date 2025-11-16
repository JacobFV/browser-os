import React, { useState, useRef, useEffect } from 'react';
import { FileSystem, IndexedDBBackend } from '@browser-os/fs';
import type { EventBus } from '@browser-os/events';
import type { FileMetadata } from '@browser-os/schemas';
import './Terminal.css';

export interface TerminalProps {
  windowId: string;
  eventBus?: EventBus;
}

// Utility functions for path resolution
const resolvePath = (path: string, cwd: string, home: string = '/home/user'): string => {
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

const normalizePath = (path: string): string => {
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

const parseCommand = (cmd: string): { command: string; args: string[]; flags: Set<string>; flagValues: Map<string, string> } => {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < cmd.length; i++) {
    const char = cmd[i];
    
    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
    } else if (char === ' ' && !inQuotes) {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }
  
  if (current) {
    parts.push(current);
  }
  
  if (parts.length === 0) {
    return { command: '', args: [], flags: new Set(), flagValues: new Map() };
  }
  
  const command = parts[0].toLowerCase();
  const args: string[] = [];
  const flags = new Set<string>();
  const flagValues = new Map<string, string>();
  
  for (let i = 1; i < parts.length; i++) {
    if (parts[i].startsWith('-')) {
      const flagStr = parts[i].substring(1);
      
      // Handle numeric flags like -10 (for head/tail)
      if (/^\d+$/.test(flagStr)) {
        flags.add('n');
        flagValues.set('n', flagStr);
      } else if (flagStr.includes('=')) {
        // Handle -n=10 format
        const [flag, value] = flagStr.split('=', 2);
        flags.add(flag);
        flagValues.set(flag, value);
      } else if (flagStr.length === 1) {
        flags.add(flagStr);
        // Check if next part is a value (for -n 10 format)
        if (i + 1 < parts.length && /^\d+$/.test(parts[i + 1])) {
          flagValues.set(flagStr, parts[i + 1]);
          i++; // Skip the value
        }
      } else {
        // Handle -abc as -a -b -c or -n10 as -n with value 10
        if (flagStr.length > 1 && /^\d+$/.test(flagStr.substring(1))) {
          // Format like -n10
          flags.add(flagStr[0]);
          flagValues.set(flagStr[0], flagStr.substring(1));
        } else {
          // Handle -abc as -a -b -c
          for (const flag of flagStr) {
            flags.add(flag);
          }
        }
      }
    } else {
      args.push(parts[i]);
    }
  }
  
  return { command, args, flags, flagValues };
};

export const Terminal: React.FC<TerminalProps> = ({ windowId, eventBus }) => {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [output, setOutput] = useState<string[]>(['Terminal v0.2.0', 'Type "help" for available commands.']);
  const [currentCommand, setCurrentCommand] = useState('');
  const [cwd, setCwd] = useState('/home/user');
  const [env, setEnv] = useState<Record<string, string>>({});
  const [fs, setFs] = useState<FileSystem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const HOME_DIR = '/home/user';

  // Initialize filesystem
  useEffect(() => {
    const initFS = async () => {
      try {
        const filesystem = new FileSystem();
        const backend = new IndexedDBBackend({ dbName: 'browser-os-fs' });
        await backend.init();
        await filesystem.mount('/', backend);
        
        // Ensure home directory exists
        if (!(await filesystem.exists(HOME_DIR))) {
          await filesystem.mkdir(HOME_DIR, { recursive: true });
        }
        
        setFs(filesystem);
        setIsInitialized(true);
      } catch (error) {
        console.error('[Terminal] Failed to initialize filesystem:', error);
        addOutput(`Error: Failed to initialize filesystem: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    initFS();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when output changes
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (lines: string | string[]) => {
    const linesArray = Array.isArray(lines) ? lines : [lines];
    setOutput((prev) => [...prev, ...linesArray]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Command handlers
  const handleLs = async (args: string[], flags: Set<string>) => {
    if (!fs) return ['Filesystem not initialized'];
    
    const path = args[0] ? resolvePath(args[0], cwd, HOME_DIR) : cwd;
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

  const handleCd = async (args: string[]) => {
    if (!fs) return ['Filesystem not initialized'];
    
    const targetPath = args[0] || HOME_DIR;
    const resolvedPath = resolvePath(targetPath, cwd, HOME_DIR);
    
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

  const handlePwd = () => {
    return [cwd];
  };

  const handleCat = async (args: string[]) => {
    if (!fs) return ['Filesystem not initialized'];
    
    if (args.length === 0) {
      return ['cat: missing file operand'];
    }
    
    const results: string[] = [];
    
    for (const arg of args) {
      const path = resolvePath(arg, cwd, HOME_DIR);
      try {
        if (!(await fs.exists(path))) {
          results.push(`cat: ${path}: No such file or directory`);
          continue;
        }
        
        const stat = await fs.stat(path);
        if (stat.type === 'directory') {
          results.push(`cat: ${path}: Is a directory`);
          continue;
        }
        
        const data = await fs.read(path);
        const text = new TextDecoder().decode(data);
        results.push(text);
      } catch (error) {
        results.push(`cat: ${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return results;
  };

  const handleTouch = async (args: string[]) => {
    if (!fs) return ['Filesystem not initialized'];
    
    if (args.length === 0) {
      return ['touch: missing file operand'];
    }
    
    const results: string[] = [];
    
    for (const arg of args) {
      const path = resolvePath(arg, cwd, HOME_DIR);
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

  const handleMkdir = async (args: string[], flags: Set<string>) => {
    if (!fs) return ['Filesystem not initialized'];
    
    if (args.length === 0) {
      return ['mkdir: missing operand'];
    }
    
    const recursive = flags.has('p');
    const results: string[] = [];
    
    for (const arg of args) {
      const path = resolvePath(arg, cwd, HOME_DIR);
      try {
        await fs.mkdir(path, { recursive });
      } catch (error) {
        results.push(`mkdir: ${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return results.length > 0 ? results : [];
  };

  const handleRm = async (args: string[], flags: Set<string>) => {
    if (!fs) return ['Filesystem not initialized'];
    
    if (args.length === 0) {
      return ['rm: missing operand'];
    }
    
    const recursive = flags.has('r');
    const results: string[] = [];
    
    for (const arg of args) {
      const path = resolvePath(arg, cwd, HOME_DIR);
      try {
        if (!(await fs.exists(path))) {
          results.push(`rm: ${path}: No such file or directory`);
          continue;
        }
        
        const stat = await fs.stat(path);
        if (stat.type === 'directory') {
          if (recursive) {
            await fs.rmdir(path, { recursive: true });
          } else {
            results.push(`rm: ${path}: Is a directory`);
          }
        } else {
          await fs.delete(path);
        }
      } catch (error) {
        results.push(`rm: ${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return results.length > 0 ? results : [];
  };

  const handleRmdir = async (args: string[]) => {
    if (!fs) return ['Filesystem not initialized'];
    
    if (args.length === 0) {
      return ['rmdir: missing operand'];
    }
    
    const results: string[] = [];
    
    for (const arg of args) {
      const path = resolvePath(arg, cwd, HOME_DIR);
      try {
        await fs.rmdir(path);
      } catch (error) {
        results.push(`rmdir: ${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return results.length > 0 ? results : [];
  };

  const handleMv = async (args: string[]) => {
    if (!fs) return ['Filesystem not initialized'];
    
    if (args.length < 2) {
      return ['mv: missing file operand'];
    }
    
    const sources = args.slice(0, -1);
    const dest = resolvePath(args[args.length - 1], cwd, HOME_DIR);
    
    try {
      const destExists = await fs.exists(dest);
      const destIsDir = destExists ? (await fs.stat(dest)).type === 'directory' : false;
      
      if (sources.length > 1 && !destIsDir) {
        return ['mv: target is not a directory'];
      }
      
      const results: string[] = [];
      
      for (const source of sources) {
        const sourcePath = resolvePath(source, cwd, HOME_DIR);
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

  const handleCp = async (args: string[], flags: Set<string>) => {
    if (!fs) return ['Filesystem not initialized'];
    
    if (args.length < 2) {
      return ['cp: missing file operand'];
    }
    
    const recursive = flags.has('r');
    const sources = args.slice(0, -1);
    const dest = resolvePath(args[args.length - 1], cwd, HOME_DIR);
    
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
        const sourcePath = resolvePath(source, cwd, HOME_DIR);
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

  const handleFind = async (args: string[]) => {
    if (!fs) return ['Filesystem not initialized'];
    
    if (args.length === 0) {
      return ['find: missing search path'];
    }
    
    const searchPath = resolvePath(args[0], cwd, HOME_DIR);
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

  const handleGrep = async (args: string[], flags: Set<string>) => {
    if (!fs) return ['Filesystem not initialized'];
    
    if (args.length < 1) {
      return ['grep: missing pattern'];
    }
    
    const pattern = args[0];
    const files = args.slice(1);
    
    if (files.length === 0) {
      return ['grep: missing file operand'];
    }
    
    const caseInsensitive = flags.has('i');
    const regex = new RegExp(pattern, caseInsensitive ? 'i' : '');
    const results: string[] = [];
    
    for (const file of files) {
      const path = resolvePath(file, cwd, HOME_DIR);
      try {
        if (!(await fs.exists(path))) {
          results.push(`grep: ${path}: No such file or directory`);
          continue;
        }
        
        const stat = await fs.stat(path);
        if (stat.type === 'directory') {
          results.push(`grep: ${path}: Is a directory`);
          continue;
        }
        
        const data = await fs.read(path);
        const text = new TextDecoder().decode(data);
        const lines = text.split('\n');
        
        lines.forEach((line, index) => {
          if (regex.test(line)) {
            const prefix = files.length > 1 ? `${path}:` : '';
            results.push(`${prefix}${index + 1}:${line}`);
          }
        });
      } catch (error) {
        results.push(`grep: ${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return results.length > 0 ? results : ['(no matches found)'];
  };

  const handleHead = async (args: string[], flags: Set<string>, flagValues: Map<string, string>) => {
    if (!fs) return ['Filesystem not initialized'];
    
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
      const path = resolvePath(args[i], cwd, HOME_DIR);
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

  const handleTail = async (args: string[], flags: Set<string>, flagValues: Map<string, string>) => {
    if (!fs) return ['Filesystem not initialized'];
    
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
      return ['tail: missing file operand'];
    }
    
    const results: string[] = [];
    
    for (let i = fileIndex; i < args.length; i++) {
      const path = resolvePath(args[i], cwd, HOME_DIR);
      try {
        if (!(await fs.exists(path))) {
          results.push(`tail: ${path}: No such file or directory`);
          continue;
        }
        
        const stat = await fs.stat(path);
        if (stat.type === 'directory') {
          results.push(`tail: ${path}: Is a directory`);
          continue;
        }
        
        const data = await fs.read(path);
        const text = new TextDecoder().decode(data);
        const lines = text.split('\n');
        const prefix = args.length - fileIndex > 1 ? `==> ${path} <==\n` : '';
        results.push(prefix + lines.slice(-numLines).join('\n'));
      } catch (error) {
        results.push(`tail: ${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return results;
  };

  const handleWc = async (args: string[], flags: Set<string>) => {
    if (!fs) return ['Filesystem not initialized'];
    
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
      const path = resolvePath(arg, cwd, HOME_DIR);
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

  const handleSort = async (args: string[]) => {
    if (!fs) return ['Filesystem not initialized'];
    
    if (args.length === 0) {
      return ['sort: missing file operand'];
    }
    
    const results: string[] = [];
    
    for (const arg of args) {
      const path = resolvePath(arg, cwd, HOME_DIR);
      try {
        if (!(await fs.exists(path))) {
          results.push(`sort: ${path}: No such file or directory`);
          continue;
        }
        
        const stat = await fs.stat(path);
        if (stat.type === 'directory') {
          results.push(`sort: ${path}: Is a directory`);
          continue;
        }
        
        const data = await fs.read(path);
        const text = new TextDecoder().decode(data);
        const lines = text.split('\n');
        const sorted = lines.sort();
        results.push(sorted.join('\n'));
      } catch (error) {
        results.push(`sort: ${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return results;
  };

  const handleUniq = async (args: string[]) => {
    if (!fs) return ['Filesystem not initialized'];
    
    if (args.length === 0) {
      return ['uniq: missing file operand'];
    }
    
    const results: string[] = [];
    
    for (const arg of args) {
      const path = resolvePath(arg, cwd, HOME_DIR);
      try {
        if (!(await fs.exists(path))) {
          results.push(`uniq: ${path}: No such file or directory`);
          continue;
        }
        
        const stat = await fs.stat(path);
        if (stat.type === 'directory') {
          results.push(`uniq: ${path}: Is a directory`);
          continue;
        }
        
        const data = await fs.read(path);
        const text = new TextDecoder().decode(data);
        const lines = text.split('\n');
        const unique: string[] = [];
        let prev = '';
        
        for (const line of lines) {
          if (line !== prev) {
            unique.push(line);
            prev = line;
          }
        }
        
        results.push(unique.join('\n'));
      } catch (error) {
        results.push(`uniq: ${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    return results;
  };

  const handleWhoami = () => {
    return ['user'];
  };

  const handleDate = () => {
    return [new Date().toLocaleString()];
  };

  const handlePs = () => {
    // Process listing would require syscall access or EventBus
    // For now, return a placeholder message
    return ['ps: Process listing requires system access (not implemented)'];
  };

  const handleEnv = () => {
    const envVars = Object.entries(env).map(([key, value]) => `${key}=${value}`);
    return envVars.length > 0 ? envVars : ['(no environment variables set)'];
  };

  const handleExport = (args: string[]) => {
    if (args.length === 0) {
      return handleEnv();
    }
    
    for (const arg of args) {
      const match = arg.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        setEnv((prev) => ({ ...prev, [key]: value }));
      } else {
        return [`export: invalid syntax: ${arg}`];
      }
    }
    
    return [];
  };

  const handleUnset = (args: string[]) => {
    if (args.length === 0) {
      return ['unset: missing variable name'];
    }
    
    for (const arg of args) {
      setEnv((prev) => {
        const newEnv = { ...prev };
        delete newEnv[arg];
        return newEnv;
      });
    }
    
    return [];
  };

  const handleLaunch = async (args: string[]) => {
    if (!eventBus) {
      return ['launch: EventBus not available. Cannot launch apps.'];
    }
    
    if (args.length === 0) {
      return ['launch: missing app ID'];
    }
    
    const appId = args[0];
    const appArgs = args.slice(1);
    
    try {
      eventBus.emit('taskbar:shortcut:clicked', {
        appId,
        forceNew: true,
        args: appArgs,
      }, { source: 'terminal' });
      
      return [`Launched app: ${appId}`];
    } catch (error) {
      return [`launch: ${error instanceof Error ? error.message : String(error)}`];
    }
  };

  const handleApps = () => {
    // App listing would require AppRegistry access
    // For now, return a placeholder message
    return ['apps: App listing requires registry access (not implemented)'];
  };

  const handleHelp = () => {
    return [
      'Available commands:',
      '',
      'File Operations:',
      '  ls [path] [-l] [-a]     - List directory contents',
      '  cd [path]                - Change directory',
      '  pwd                      - Print working directory',
      '  cat <file>...            - Display file contents',
      '  touch <file>...          - Create empty file or update timestamp',
      '  mkdir <dir>... [-p]      - Create directory',
      '  rm <file>... [-r]        - Remove file or directory',
      '  rmdir <dir>...           - Remove empty directory',
      '  mv <source>... <dest>   - Move/rename file or directory',
      '  cp <source>... <dest> [-r] - Copy file or directory',
      '  find <path> [pattern]   - Search for files/directories',
      '  grep <pattern> <file>... [-i] - Search file contents',
      '',
      'Text Processing:',
      '  head <file>... [-n N]   - Show first N lines (default 10)',
      '  tail <file>... [-n N]   - Show last N lines (default 10)',
      '  wc <file>... [-l] [-w] [-c] - Count lines, words, characters',
      '  sort <file>...           - Sort lines of text',
      '  uniq <file>...           - Remove duplicate lines',
      '',
      'System Information:',
      '  whoami                   - Show current user',
      '  date                     - Show current date/time',
      '  ps                       - List processes (not implemented)',
      '  env                      - Show environment variables',
      '  export VAR=value         - Set environment variable',
      '  unset VAR                - Unset environment variable',
      '',
      'App Launching:',
      '  launch <appId> [args]... - Launch an app',
      '  apps                     - List available apps (not implemented)',
      '',
      'Other:',
      '  help                     - Show this help message',
      '  clear                    - Clear the terminal screen',
      '  echo <text>...           - Print text to the terminal',
      '  history                  - Show command history',
      '',
      'Aliases:',
      '  ll                       - ls -l',
      '  la                       - ls -a',
    ];
  };

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) {
      return;
    }

    // Handle aliases
    let processedCmd = cmd.trim();
    if (processedCmd === 'll') {
      processedCmd = 'ls -l';
    } else if (processedCmd === 'la') {
      processedCmd = 'ls -a';
    }

    // Add command to history
    const newHistory = [...commandHistory, cmd];
    setCommandHistory(newHistory);
    setHistoryIndex(newHistory.length);

    // Display command in output
    addOutput(`$ ${cmd}`);

    if (!isInitialized || !fs) {
      addOutput('Error: Filesystem not initialized. Please wait...');
      return;
    }

    // Parse command
    const { command, args, flags, flagValues } = parseCommand(processedCmd);

    let result: string[] = [];

    try {
      switch (command) {
        case 'help':
          result = handleHelp();
          break;

        case 'clear':
          setOutput([]);
          return;

        case 'echo':
          result = [args.join(' ') || ''];
          break;

        case 'history':
          if (commandHistory.length === 0) {
            result = ['No commands in history.'];
          } else {
            result = commandHistory.map((cmd, idx) => `${idx + 1}. ${cmd}`);
          }
          break;

        case 'ls':
          result = await handleLs(args, flags);
          break;

        case 'cd':
          result = await handleCd(args);
          break;

        case 'pwd':
          result = handlePwd();
          break;

        case 'cat':
          result = await handleCat(args);
          break;

        case 'touch':
          result = await handleTouch(args);
          break;

        case 'mkdir':
          result = await handleMkdir(args, flags);
          break;

        case 'rm':
          result = await handleRm(args, flags);
          break;

        case 'rmdir':
          result = await handleRmdir(args);
          break;

        case 'mv':
          result = await handleMv(args);
          break;

        case 'cp':
          result = await handleCp(args, flags);
          break;

        case 'find':
          result = await handleFind(args);
          break;

        case 'grep':
          result = await handleGrep(args, flags);
          break;

        case 'head':
          result = await handleHead(args, flags, flagValues);
          break;

        case 'tail':
          result = await handleTail(args, flags, flagValues);
          break;

        case 'wc':
          result = await handleWc(args, flags);
          break;

        case 'sort':
          result = await handleSort(args);
          break;

        case 'uniq':
          result = await handleUniq(args);
          break;

        case 'whoami':
          result = handleWhoami();
          break;

        case 'date':
          result = handleDate();
          break;

        case 'ps':
          result = handlePs();
          break;

        case 'env':
          result = handleEnv();
          break;

        case 'export':
          result = handleExport(args);
          break;

        case 'unset':
          result = handleUnset(args);
          break;

        case 'launch':
        case 'run':
          result = await handleLaunch(args);
          break;

        case 'apps':
          result = handleApps();
          break;

        default:
          result = [`Command not found: ${command}. Type "help" for available commands.`];
      }
    } catch (error) {
      result = [`Error: ${error instanceof Error ? error.message : String(error)}`];
    }

    if (result.length > 0) {
      addOutput(result);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentCommand);
    setCurrentCommand('');
    setHistoryIndex(commandHistory.length + 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      } else {
        setHistoryIndex(commandHistory.length);
        setCurrentCommand('');
      }
    }
  };

  const getPrompt = () => {
    const dirName = cwd === HOME_DIR ? '~' : cwd.split('/').pop() || '/';
    return `user@browser-os:${dirName}$`;
  };

  return (
    <div className="terminal">
      <div className="terminal-output" ref={outputRef}>
        {output.map((line, index) => (
          <div key={index} className="terminal-line">
            {line}
          </div>
        ))}
      </div>
      <form className="terminal-input-form" onSubmit={handleSubmit}>
        <span className="terminal-prompt">{getPrompt()}</span>
        <input
          ref={inputRef}
          type="text"
          className="terminal-input"
          value={currentCommand}
          onChange={(e) => setCurrentCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
        />
      </form>
    </div>
  );
};
