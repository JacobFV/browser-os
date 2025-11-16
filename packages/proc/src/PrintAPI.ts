/**
 * Print API for processes to print content
 */

export interface PrintOptions {
  silent?: boolean;
  printBackground?: boolean;
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  scale?: number;
  pageRanges?: Array<{ from: number; to: number }>;
  headerFooter?: boolean;
}

/**
 * Print API factory
 */
export class PrintAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Print content from HTML string
   */
  async printHTML(html: string, options?: PrintOptions): Promise<void> {
    await this.syscall('print.html', { html, options });
  }

  /**
   * Print current window
   */
  async printWindow(options?: PrintOptions): Promise<void> {
    await this.syscall('print.window', { options });
  }

  /**
   * Print URL
   */
  async printURL(url: string, options?: PrintOptions): Promise<void> {
    await this.syscall('print.url', { url, options });
  }
}

