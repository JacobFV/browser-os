/**
 * Command parsing utilities
 */

export interface ParsedCommand {
  command: string;
  args: string[];
  flags: Set<string>;
  flagValues: Map<string, string>;
}

export const parseCommand = (cmd: string): ParsedCommand => {
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

