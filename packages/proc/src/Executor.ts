import type { OSAPI } from './types';

/**
 * Executes app code in a sandboxed environment
 */
export class Executor {
  /**
   * Execute JavaScript code with provided OS API
   */
  async exec(code: string, api: OSAPI): Promise<void> {
    // Create a sandboxed execution context
    const sandbox = {
      os: api,
      console: {
        log: (...args: unknown[]) => console.log(`[PID ${api.pid}]`, ...args),
        error: (...args: unknown[]) => console.error(`[PID ${api.pid}]`, ...args),
        warn: (...args: unknown[]) => console.warn(`[PID ${api.pid}]`, ...args),
        info: (...args: unknown[]) => console.info(`[PID ${api.pid}]`, ...args),
      },
      setTimeout: globalThis.setTimeout.bind(globalThis),
      clearTimeout: globalThis.clearTimeout.bind(globalThis),
      setInterval: globalThis.setInterval.bind(globalThis),
      clearInterval: globalThis.clearInterval.bind(globalThis),
      Date: Date,
      Math: Math,
      JSON: JSON,
      Array: Array,
      Object: Object,
      String: String,
      Number: Number,
      Boolean: Boolean,
      Promise: Promise,
      Error: Error,
      TypeError: TypeError,
      ReferenceError: ReferenceError,
      RangeError: RangeError,
    };

    // Wrap code in async function to support top-level await
    const wrappedCode = `
      (async function() {
        ${code}
      })();
    `;

    // Create function with sandboxed scope
    const func = new Function(
      ...Object.keys(sandbox),
      wrappedCode
    );

    try {
      await func(...Object.values(sandbox));
    } catch (error) {
      console.error(`[PID ${api.pid}] Execution error:`, error);
      throw error;
    }
  }
}

