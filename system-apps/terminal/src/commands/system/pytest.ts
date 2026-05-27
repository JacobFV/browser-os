import type { CommandHandler } from '../types';

export const pytest: CommandHandler = (args) => {
  const verbose = args.includes('-v') || args.includes('--verbose');
  const k = args.indexOf('-k');
  const filter = k >= 0 ? args[k + 1] || '' : '';
  const ran = 4 + Math.floor(Math.random() * 6);
  const passed = ran - Math.floor(Math.random() * 2);
  const failed = ran - passed;
  const elapsed = (Math.random() * 2 + 0.4).toFixed(2);
  const out: string[] = [
    '============================= test session starts ==============================',
    'platform linux -- Python 3.12.1, pytest-7.4.4, pluggy-1.3.0',
    'rootdir: /repo',
  ];
  if (filter) out.push(`pytest -k ${filter}`);
  out.push(`collected ${ran} items`, '');
  for (let i = 0; i < ran; i++) {
    const ok = i < passed;
    if (verbose) out.push(`tests/test_unit.py::test_${i} ${ok ? 'PASSED' : 'FAILED'}`);
    else out.push(`tests/test_unit.py ${ok ? '.' : 'F'}`);
  }
  out.push('');
  out.push(failed === 0
    ? `============================== ${ran} passed in ${elapsed}s ==============================`
    : `========================= ${failed} failed, ${passed} passed in ${elapsed}s =========================`);
  return out;
};
