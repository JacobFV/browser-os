import type { CommandHandler } from '../types';

function impl(toolName: string, args: string[]): string[] {
  const sub = args[0] || '';
  if (sub === '--version' || sub === '-v') {
    return [toolName === 'npm' ? '10.2.5' : toolName === 'pnpm' ? '8.15.1' : '1.22.21'];
  }
  if (sub === 'install' || sub === 'i') {
    return [
      'added 142 packages, and audited 143 packages in 1s',
      '', '28 packages are looking for funding',
      'found 0 vulnerabilities',
    ];
  }
  if (sub === 'run') {
    const script = args[1] || 'start';
    return [`> ${script}`, `> echo "running ${script}"`, '', `running ${script}`];
  }
  if (sub === 'test') {
    return ['PASS  tests/example.spec.ts', 'Tests: 8 passed, 8 total', 'Time:   1.42s'];
  }
  if (sub === 'build') {
    return ['> build', '✓ 42 modules transformed.', 'dist/index.html  0.62 kB', '✓ built in 1.42s'];
  }
  return [`Usage: ${toolName} <command>`];
}

export const npm: CommandHandler = (args) => impl('npm', args);
export const pnpm: CommandHandler = (args) => impl('pnpm', args);
export const yarn: CommandHandler = (args) => impl('yarn', args);

export const make: CommandHandler = (args) => {
  const target = args[0] || 'all';
  return [
    "make[1]: Entering directory '/repo'",
    'gcc -Wall -O2 -c main.c -o main.o',
    `gcc -Wall -O2 main.o -o ${target}`,
    "make[1]: Leaving directory '/repo'",
  ];
};
