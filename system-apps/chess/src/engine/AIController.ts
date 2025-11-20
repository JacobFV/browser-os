import type { ChessGameEngine } from './ChessGameEngine';

export interface AIConfig {
  difficulty: number; // 1-10 scale
  skillLevel?: number; // 0-20 for Stockfish
  depth?: number;
  movetime?: number; // milliseconds
}

export interface AIMoveResult {
  move: string;
  evaluation?: number;
  depth?: number;
  nodes?: number;
  time?: number;
}

export class AIController {
  private worker: Worker | null = null;
  private isReady = false;
  private config: AIConfig;
  private resolveMove: ((result: AIMoveResult) => void) | null = null;
  private rejectMove: ((error: Error) => void) | null = null;

  constructor(config: AIConfig) {
    this.config = config;
    this.initializeWorker();
  }

  /**
   * Initialize Web Worker for AI computation
   */
  private initializeWorker(): void {
    // Create inline worker that loads Stockfish from CDN
    const workerCode = `
      // Load Stockfish from CDN
      let Stockfish;
      if (typeof importScripts !== 'undefined') {
        try {
          importScripts('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');
          Stockfish = self.Stockfish || self.stockfish;
        } catch (e) {
          console.error('Failed to load Stockfish:', e);
        }
      } else {
        Stockfish = self.Stockfish || self.stockfish;
      }

      let stockfish = null;
      let isReady = false;

      self.onmessage = (e) => {
        const { type, payload } = e.data;

        if (type === 'init') {
          if (!Stockfish) {
            self.postMessage({ type: 'error', payload: { message: 'Stockfish not available' } });
            return;
          }
          stockfish = new Stockfish();
          isReady = false;

          stockfish.onmessage = (line) => {
            if (line === 'uciok') {
              isReady = true;
              self.postMessage({ type: 'ready' });
            } else if (line.startsWith('bestmove')) {
              const match = line.match(/bestmove\\s+(\\S+)/);
              if (match) {
                self.postMessage({
                  type: 'bestmove',
                  payload: { move: match[1] },
                });
              }
            } else if (line.startsWith('info')) {
              const info = {};
              const depthMatch = line.match(/depth\\s+(\\d+)/);
              const scoreMatch = line.match(/score\\s+cp\\s+(-?\\d+)/);
              const nodesMatch = line.match(/nodes\\s+(\\d+)/);
              const timeMatch = line.match(/time\\s+(\\d+)/);

              if (depthMatch) info.depth = parseInt(depthMatch[1], 10);
              if (scoreMatch) info.score = parseInt(scoreMatch[1], 10);
              if (nodesMatch) info.nodes = parseInt(nodesMatch[1], 10);
              if (timeMatch) info.time = parseInt(timeMatch[1], 10);

              if (Object.keys(info).length > 0) {
                self.postMessage({
                  type: 'info',
                  payload: info,
                });
              }
            }
          };

          stockfish.postMessage('uci');
        } else if (type === 'setOption' && isReady && stockfish) {
          const { name, value } = payload;
          stockfish.postMessage(\`setoption name \${name} value \${value}\`);
        } else if (type === 'position' && isReady && stockfish) {
          const { fen, moves } = payload;
          if (moves && moves.length > 0) {
            stockfish.postMessage(\`position fen \${fen} moves \${moves.join(' ')}\`);
          } else {
            stockfish.postMessage(\`position fen \${fen}\`);
          }
        } else if (type === 'go' && isReady && stockfish) {
          const { depth, movetime, skillLevel } = payload;
          if (skillLevel !== undefined) {
            stockfish.postMessage(\`setoption name Skill Level value \${skillLevel}\`);
          }
          let command = 'go';
          if (depth) {
            command += \` depth \${depth}\`;
          }
          if (movetime) {
            command += \` movetime \${movetime}\`;
          }
          stockfish.postMessage(command);
        } else if (type === 'stop' && isReady && stockfish) {
          stockfish.postMessage('stop');
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));

    this.worker.onmessage = (e) => {
      const { type, payload } = e.data;

      if (type === 'ready') {
        this.isReady = true;
        this.setDifficulty(this.config.difficulty);
      } else if (type === 'bestmove') {
        if (this.resolveMove) {
          this.resolveMove({
            move: payload.move,
          });
          this.resolveMove = null;
          this.rejectMove = null;
        }
      } else if (type === 'info') {
        // Store evaluation info for later use
      }
    };

    this.worker.onerror = (error) => {
      if (this.rejectMove) {
        this.rejectMove(new Error(`AI Worker error: ${error.message}`));
        this.resolveMove = null;
        this.rejectMove = null;
      }
    };

    // Initialize Stockfish
    this.worker.postMessage({ type: 'init' });
  }

  /**
   * Set difficulty level (1-10)
   */
  setDifficulty(difficulty: number): void {
    this.config.difficulty = Math.max(1, Math.min(10, difficulty));
    
    // Map difficulty to Stockfish skill level (0-20)
    // Lower difficulty = lower skill level
    const skillLevel = Math.floor((this.config.difficulty - 1) * 2);
    
    if (this.isReady && this.worker) {
      this.worker.postMessage({
        type: 'setOption',
        payload: { name: 'Skill Level', value: skillLevel },
      });
    }
  }

  /**
   * Get best move for current position
   */
  async getBestMove(engine: ChessGameEngine): Promise<AIMoveResult> {
    if (!this.isReady || !this.worker) {
      throw new Error('AI controller not ready');
    }

    return new Promise((resolve, reject) => {
      this.resolveMove = resolve;
      this.rejectMove = reject;

      const fen = engine.getFen();
      const moves = engine.getHistoryNotation();

      // Set position
      this.worker!.postMessage({
        type: 'position',
        payload: { fen, moves },
      });

      // Calculate difficulty-based parameters
      const depth = this.calculateDepth(this.config.difficulty);
      const movetime = this.calculateMovetime(this.config.difficulty);

      // Request move
      this.worker.postMessage({
        type: 'go',
        payload: {
          depth,
          movetime,
          skillLevel: Math.floor((this.config.difficulty - 1) * 2),
        },
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.rejectMove) {
          this.worker?.postMessage({ type: 'stop' });
          reject(new Error('AI move calculation timeout'));
          this.resolveMove = null;
          this.rejectMove = null;
        }
      }, 30000);
    });
  }

  /**
   * Calculate search depth based on difficulty
   */
  private calculateDepth(difficulty: number): number {
    // Higher difficulty = deeper search
    // Range: 3-15 depth
    return Math.floor(3 + (difficulty / 10) * 12);
  }

  /**
   * Calculate move time based on difficulty
   */
  private calculateMovetime(difficulty: number): number {
    // Higher difficulty = more thinking time
    // Range: 500ms - 5000ms
    return Math.floor(500 + (difficulty / 10) * 4500);
  }

  /**
   * Stop current calculation
   */
  stop(): void {
    if (this.worker && this.isReady) {
      this.worker.postMessage({ type: 'stop' });
    }
    if (this.rejectMove) {
      this.rejectMove(new Error('AI calculation stopped'));
      this.resolveMove = null;
      this.rejectMove = null;
    }
  }

  /**
   * Cleanup worker
   */
  destroy(): void {
    this.stop();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
  }
}

