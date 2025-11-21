// Worker for Stockfish AI computation
// Stockfish.js will be loaded via importScripts or as a global

export interface AIMessage {
  type: 'init' | 'position' | 'go' | 'stop' | 'setOption';
  payload?: any;
}

let stockfish: any = null;
let isReady = false;

// Load Stockfish - try multiple methods
function loadStockfish() {
  // Try global Stockfish first (if loaded via script tag)
  if (typeof (self as any).Stockfish !== 'undefined') {
    return (self as any).Stockfish;
  }
  if (typeof (self as any).stockfish !== 'undefined') {
    return (self as any).stockfish;
  }
  
  // Try importScripts (for web workers)
  if (typeof (self as any).importScripts !== 'undefined') {
    try {
      (self as any).importScripts('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');
      return (self as any).Stockfish || (self as any).stockfish;
    } catch (e) {
      console.error('Failed to load Stockfish:', e);
    }
  }
  
  return null;
}

self.onmessage = (e: MessageEvent<AIMessage>) => {
  const { type, payload } = e.data;

  if (type === 'init') {
    const StockfishClass = loadStockfish();
    if (!StockfishClass) {
      self.postMessage({ type: 'error', payload: { message: 'Stockfish not available' } });
      return;
    }
    
    stockfish = new StockfishClass();
    isReady = false;

    stockfish.onmessage = (line: string) => {
      if (line === 'uciok') {
        isReady = true;
        self.postMessage({ type: 'ready' });
      } else if (line.startsWith('bestmove')) {
        const match = line.match(/bestmove\s+(\S+)/);
        if (match) {
          self.postMessage({
            type: 'bestmove',
            payload: { move: match[1] },
          });
        }
      } else if (line.startsWith('info')) {
        // Parse info messages for evaluation, depth, etc.
        const info: any = {};
        const depthMatch = line.match(/depth\s+(\d+)/);
        const scoreMatch = line.match(/score\s+cp\s+(-?\d+)/);
        const nodesMatch = line.match(/nodes\s+(\d+)/);
        const timeMatch = line.match(/time\s+(\d+)/);

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
    stockfish.postMessage(`setoption name ${name} value ${value}`);
  } else if (type === 'position' && isReady && stockfish) {
    const { fen, moves } = payload;
    if (moves && moves.length > 0) {
      stockfish.postMessage(`position fen ${fen} moves ${moves.join(' ')}`);
    } else {
      stockfish.postMessage(`position fen ${fen}`);
    }
  } else if (type === 'go' && isReady && stockfish) {
    const { depth, movetime, skillLevel } = payload;
    
    if (skillLevel !== undefined) {
      stockfish.postMessage(`setoption name Skill Level value ${skillLevel}`);
    }
    
    let command = 'go';
    if (depth) {
      command += ` depth ${depth}`;
    }
    if (movetime) {
      command += ` movetime ${movetime}`;
    }
    
    stockfish.postMessage(command);
  } else if (type === 'stop' && isReady && stockfish) {
    stockfish.postMessage('stop');
  }
};

