import type { EventBus } from '@browser-os/events';

export interface PrintManagerOptions {
  eventBus?: EventBus;
}

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
 * Print Manager for printing content
 */
export class PrintManager {
  private eventBus?: EventBus;

  constructor(options?: PrintManagerOptions) {
    this.eventBus = options?.eventBus;
  }

  /**
   * Print content from HTML string
   */
  async printHTML(html: string, options?: PrintOptions): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load
    await new Promise((resolve) => {
      printWindow.addEventListener('load', resolve, { once: true });
      // Fallback timeout
      setTimeout(resolve, 1000);
    });

    this.eventBus?.emit('print:beforePrint', { html }, { source: 'print-manager' });

    printWindow.print();

    // Close window after printing (if silent)
    if (options?.silent) {
      printWindow.close();
    } else {
      // Close after a delay to allow print dialog
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }

    this.eventBus?.emit('print:afterPrint', { html }, { source: 'print-manager' });
  }

  /**
   * Print current window
   */
  async printWindow(options?: PrintOptions): Promise<void> {
    this.eventBus?.emit('print:beforePrint', {}, { source: 'print-manager' });
    window.print();
    this.eventBus?.emit('print:afterPrint', {}, { source: 'print-manager' });
  }

  /**
   * Print URL
   */
  async printURL(url: string, options?: PrintOptions): Promise<void> {
    const printWindow = window.open(url, '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    // Wait for content to load
    await new Promise((resolve) => {
      printWindow.addEventListener('load', resolve, { once: true });
      // Fallback timeout
      setTimeout(resolve, 2000);
    });

    this.eventBus?.emit('print:beforePrint', { url }, { source: 'print-manager' });

    printWindow.print();

    // Close window after printing
    if (options?.silent) {
      printWindow.close();
    } else {
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }

    this.eventBus?.emit('print:afterPrint', { url }, { source: 'print-manager' });
  }
}

