import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCw, Pause, Play } from 'lucide-react';
import { Button } from '@browser-os/ui';
import './Tetris.css';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
  [[1, 0, 0], [1, 1, 1]], // J
  [[0, 0, 1], [1, 1, 1]], // L
];

const COLORS = ['#00D9FF', '#FFD700', '#9C27B0', '#4CAF50', '#F44336', '#2196F3', '#FF9800'];

interface Piece {
  shape: number[][];
  x: number;
  y: number;
  color: string;
}

const createPiece = (): Piece => {
  const shapeIndex = Math.floor(Math.random() * SHAPES.length);
  return {
    shape: SHAPES[shapeIndex],
    x: Math.floor(BOARD_WIDTH / 2) - 1,
    y: 0,
    color: COLORS[shapeIndex],
  };
};

export const Tetris: React.FC<{ os?: any }> = ({ os }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const dropTimeRef = useRef(1000);

  const initializeBoard = useCallback(() => {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
  }, []);

  useEffect(() => {
    setBoard(initializeBoard());
    setCurrentPiece(createPiece());
  }, [initializeBoard]);

  const isValidPosition = useCallback((piece: Piece, board: number[][], dx = 0, dy = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + dx;
          const newY = piece.y + y + dy;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const placePiece = useCallback((piece: Piece, board: number[][]): number[][] => {
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = 1;
          }
        }
      }
    }
    return newBoard;
  }, []);

  const clearLines = useCallback((board: number[][]): { newBoard: number[][]; linesCleared: number } => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      const isFull = row.every(cell => cell !== 0);
      if (isFull) linesCleared++;
      return !isFull;
    });
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    return { newBoard, linesCleared };
  }, []);

  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    setCurrentPiece(prev => {
      if (!prev) return null;
      
      if (isValidPosition(prev, board, 0, 1)) {
        return { ...prev, y: prev.y + 1 };
      } else {
        // Piece has landed
        const newBoard = placePiece(prev, board);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        setBoard(clearedBoard);
        
        if (linesCleared > 0) {
          setLines(prev => prev + linesCleared);
          setScore(prev => prev + linesCleared * 100 * level);
          const newLevel = Math.floor((lines + linesCleared) / 10) + 1;
          if (newLevel > level) {
            setLevel(newLevel);
            dropTimeRef.current = Math.max(100, 1000 - (newLevel - 1) * 100);
          }
        }
        
        // Check game over
        if (prev.y <= 0) {
          setGameOver(true);
          return null;
        }
        
        return createPiece();
      }
    });
  }, [currentPiece, board, gameOver, isPaused, isValidPosition, placePiece, clearLines, lines, level]);

  useEffect(() => {
    if (!gameOver && !isPaused && currentPiece) {
      gameLoopRef.current = setInterval(dropPiece, dropTimeRef.current);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameOver, isPaused, currentPiece, dropPiece]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameOver || !currentPiece) return;

    if (e.key === 'ArrowLeft') {
      setCurrentPiece(prev => {
        if (!prev) return null;
        return isValidPosition(prev, board, -1, 0) ? { ...prev, x: prev.x - 1 } : prev;
      });
    } else if (e.key === 'ArrowRight') {
      setCurrentPiece(prev => {
        if (!prev) return null;
        return isValidPosition(prev, board, 1, 0) ? { ...prev, x: prev.x + 1 } : prev;
      });
    } else if (e.key === 'ArrowDown') {
      dropPiece();
    } else if (e.key === 'ArrowUp') {
      setCurrentPiece(prev => {
        if (!prev) return null;
        const rotated = prev.shape[0].map((_, i) => prev.shape.map(row => row[i]).reverse());
        const rotatedPiece = { ...prev, shape: rotated };
        return isValidPosition(rotatedPiece, board) ? rotatedPiece : prev;
      });
    } else if (e.key === ' ' || e.key === 'p') {
      e.preventDefault();
      setIsPaused(prev => !prev);
    }
  }, [gameOver, currentPiece, board, isValidPosition, dropPiece]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const resetGame = () => {
    setBoard(initializeBoard());
    setCurrentPiece(createPiece());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    dropTimeRef.current = 1000;
  };

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = 2; // Mark as current piece
            }
          }
        }
      }
    }

    return displayBoard;
  };

  return (
    <div className="tetris-app">
      <div className="tetris-game">
        <div className="tetris-sidebar">
          <div className="tetris-stats">
            <div className="tetris-stat">
              <div className="tetris-stat-label">Score</div>
              <div className="tetris-stat-value">{score}</div>
            </div>
            <div className="tetris-stat">
              <div className="tetris-stat-label">Level</div>
              <div className="tetris-stat-value">{level}</div>
            </div>
            <div className="tetris-stat">
              <div className="tetris-stat-label">Lines</div>
              <div className="tetris-stat-value">{lines}</div>
            </div>
          </div>

          <div className="tetris-controls">
            {gameOver ? (
              <Button variant="primary" onClick={resetGame} size="lg">
                <RotateCw size={18} style={{ marginRight: 8 }} />
                Play Again
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setIsPaused(!isPaused)} size="md">
                  {isPaused ? (
                    <>
                      <Play size={16} style={{ marginRight: 8 }} />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause size={16} style={{ marginRight: 8 }} />
                      Pause
                    </>
                  )}
                </Button>
                <Button variant="ghost" onClick={resetGame} size="md">
                  <RotateCw size={16} style={{ marginRight: 8 }} />
                  Reset
                </Button>
              </>
            )}
          </div>

          <div className="tetris-instructions">
            <div className="tetris-instructions-title">Controls</div>
            <div className="tetris-instructions-list">
              <div>← → Move</div>
              <div>↓ Drop</div>
              <div>↑ Rotate</div>
              <div>Space/P Pause</div>
            </div>
          </div>
        </div>

        <div className="tetris-board-container">
          {gameOver && (
            <div className="tetris-game-over">
              <div className="tetris-game-over-title">Game Over!</div>
              <div className="tetris-game-over-score">Final Score: {score}</div>
            </div>
          )}
          {isPaused && !gameOver && (
            <div className="tetris-pause-overlay">
              <div className="tetris-pause-text">Paused</div>
            </div>
          )}
          <div className="tetris-board">
            {renderBoard().map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className={`tetris-cell ${
                    cell === 1 ? 'filled' : cell === 2 ? 'current' : ''
                  }`}
                  style={cell === 2 && currentPiece ? { backgroundColor: currentPiece.color } : {}}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

