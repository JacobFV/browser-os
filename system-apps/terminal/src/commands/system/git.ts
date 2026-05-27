import type { CommandHandler } from '../types';

const sha = () => Math.random().toString(16).slice(2, 9);

export const git: CommandHandler = (args) => {
  const sub = args[0] || '';
  if (!sub || sub === '--version') return ['git version 2.43.0'];
  if (sub === 'add') return [];
  if (sub === 'commit') {
    const mIdx = args.indexOf('-m');
    const amIdx = args.indexOf('-am');
    const msg = (mIdx >= 0 ? args.slice(mIdx + 1) : amIdx >= 0 ? args.slice(amIdx + 1) : [])
      .join(' ').replace(/^['"]|['"]$/g, '') || 'commit';
    return [`[main ${sha()}] ${msg}`, ` 1 file changed, 1 insertion(+)`];
  }
  if (sub === 'push') {
    const remote = args[1] || 'origin';
    const branch = args[2] || 'main';
    return [
      'Enumerating objects: 5, done.',
      'Counting objects: 100% (5/5), done.',
      'Writing objects: 100% (3/3), 412 bytes | 412.00 KiB/s, done.',
      'Total 3 (delta 2), reused 0 (delta 0), pack-reused 0',
      'To github.com:acme/api.git',
      `   a1b2c3d..e4f5g6h  ${branch} -> ${branch}`,
    ];
  }
  if (sub === 'pull') return ['Already up to date.'];
  if (sub === 'fetch') return ['From github.com:acme/api', ' * [new branch]      main       -> origin/main'];
  if (sub === 'checkout') {
    const tgt = args.slice(1).find((a) => !a.startsWith('-')) || 'main';
    return [`Switched to branch '${tgt}'`];
  }
  if (sub === 'status') return ['On branch main', "Your branch is up to date with 'origin/main'.", '', 'nothing to commit, working tree clean'];
  if (sub === 'log') {
    return [
      `commit ${sha()} (HEAD -> main, origin/main)`,
      'Author: User <user@example.com>',
      'Date:   ' + new Date().toString(),
      '', '    Latest commit',
    ];
  }
  if (sub === 'clone') {
    const repo = args[1] || 'repo';
    const name = repo.split('/').pop()?.replace(/\.git$/, '') || 'repo';
    return [`Cloning into '${name}'...`, 'remote: Enumerating objects: 142, done.', 'Receiving objects: 100% (142/142), done.', 'Resolving deltas: 100% (75/75), done.'];
  }
  if (sub === 'branch') return ['* main', '  develop', '  feature/new-ui'];
  if (sub === 'remote') return ['origin\thttps://github.com/user/repo.git (fetch)', 'origin\thttps://github.com/user/repo.git (push)'];
  if (sub === 'diff') return [];
  if (sub === 'init') return ['Initialized empty Git repository in /repo/.git/'];
  return [`git: '${sub}' is not a git command. See 'git --help'.`];
};
