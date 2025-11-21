import React, { useState, useCallback, useEffect } from 'react';
import { RotateCw, Flag } from 'lucide-react';
import { Button } from '@browser-os/ui';
import './Minesweeper.css';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

interface GameConfig {
  rows: number;
  cols: number;
  mines: number;
}

const DIFFICULTIES: Record<Difficulty, GameConfig> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

export const Minesweeper: React.FC<{ os?: any }> = ({ os }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flagsRemaining, setFlagsRemaining] = useState(0);
  const [firstClick, setFirstClick] = useState(true);

  const config = DIFFICULTIES[difficulty];

  const initializeBoard = useCallback(() => {
    const newBoard: Cell[][] = [];
    for (let i = 0; i < config.rows; i++) {
      newBoard[i] = [];
      for (let j = 0; j < config.cols; j++) {
        newBoard[i][j] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        };
      }
    }
    return newBoard;
  }, [config]);

  const placeMines = useCallback((board: Cell[][], excludeRow: number, excludeCol: number) => {
    const newBoard = board.map(row => [...row]);
    let minesPlaced = 0;

    while (minesPlaced < config.mines) {
      const row = Math.floor(Math.random() * config.rows);
      const col = Math.floor(Math.random() * config.cols);

      // Don't place mine on first click or where one already exists
      if (
        (row === excludeRow && col === excludeCol) ||
        newBoard[row][col].isMine
      ) {
        continue;
      }

      newBoard[row][col].isMine = true;
      minesPlaced++;
    }

    // Calculate adjacent mines
    for (let i = 0; i < config.rows; i++) {
      for (let j = 0; j < config.cols; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (
                ni >= 0 &&
                ni < config.rows &&
                nj >= 0 &&
                nj < config.cols &&
                newBoard[ni][nj].isMine
              ) {
                count++;
              }
            }
          }
          newBoard[i][j].adjacentMines = count;
        }
      }
    }

    return newBoard;
  }, [config]);

  const revealRecursive = useCallback((board: Cell[][], row: number, col: number): Cell[][] => {
    if (
      row < 0 ||
      row >= config.rows ||
      col < 0 ||
      col >= config.cols ||
      board[row][col].isRevealed ||
      board[row][col].isFlagged
    ) {
      return board;
    }

    board[row][col].isRevealed = true;

    if (board[row][col].isMine) {
      setGameOver(true);
      // Reveal all mines
      for (let i = 0; i < config.rows; i++) {
        for (let j = 0; j < config.cols; j++) {
          if (board[i][j].isMine) {
            board[i][j].isRevealed = true;
          }
        }
      }
      return board;
    }

    if (board[row][col].adjacentMines === 0) {
      // Reveal adjacent cells
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          if (di === 0 && dj === 0) continue;
          revealRecursive(board, row + di, col + dj);
        }
      }
    }

    return board;
  }, [config]);

  const revealCell = useCallback((row: number, col: number) => {
    if (gameOver || gameWon) return;

    setBoard(prev => {
      const newBoard = prev.map(r => r.map(c => ({ ...c })));

      if (firstClick) {
        const boardWithMines = placeMines(newBoard, row, col);
        setFirstClick(false);
        return revealRecursive(boardWithMines, row, col);
      }

      return revealRecursive(newBoard, row, col);
    });
  }, [gameOver, gameWon, firstClick, placeMines, revealRecursive]);

  const toggleFlag = useCallback((row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameOver || gameWon) return;

    setBoard(prev => {
      const newBoard = prev.map(r => r.map(c => ({ ...c })));
      if (!newBoard[row][col].isRevealed) {
        newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
      }
      return newBoard;
    });
  }, [gameOver, gameWon]);

  const resetGame = useCallback(() => {
    setBoard(initializeBoard());
    setGameOver(false);
    setGameWon(false);
    setFirstClick(true);
    setFlagsRemaining(config.mines);
  }, [initializeBoard, config.mines]);

  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

  useEffect(() => {
    const flagged = board.flat().filter(cell => cell.isFlagged).length;
    setFlagsRemaining(config.mines - flagged);

    // Check win condition
    const revealed = board.flat().filter(cell => cell.isRevealed && !cell.isMine).length;
    const totalCells = config.rows * config.cols;
    if (revealed === totalCells - config.mines && !gameOver) {
      setGameWon(true);
    }
  }, [board, config, gameOver]);

  const getCellColor = (mines: number): string => {
    const colors = [
      'transparent',
      '#007aff',
      '#34c759',
      '#ff3b30',
      '#5856d6',
      '#ff9500',
      '#ff2d55',
      '#000000',
      '#86868b',
    ];
    return colors[mines] || colors[0];
  };

  return (
    <div className="minesweeper-app">
      <div className="minesweeper-game">
        <div className="minesweeper-header">
          <div className="minesweeper-difficulty">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="minesweeper-difficulty-select"
              disabled={!firstClick}
            >
              <option value="easy">Easy (9×9)</option>
              <option value="medium">Medium (16×16)</option>
              <option value="hard">Hard (16×30)</option>
            </select>
          </div>
          <div className="minesweeper-stats">
            <div className="minesweeper-stat">
              <Flag size={16} />
              <span>{flagsRemaining}</span>
            </div>
          </div>
        </div>

        <div className="minesweeper-board-container">
          <div
            className="minesweeper-board"
            style={{
              gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
              gridTemplateRows: `repeat(${config.rows}, 1fr)`,
            }}
          >
            {board.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`minesweeper-cell ${
                    cell.isRevealed
                      ? cell.isMine
                        ? 'mine'
                        : 'revealed'
                      : cell.isFlagged
                      ? 'flagged'
                      : ''
                  }`}
                  onClick={() => !cell.isFlagged && revealCell(i, j)}
                  onContextMenu={(e) => toggleFlag(i, j, e)}
                >
                  {cell.isRevealed && cell.isMine && (
                    <span className="minesweeper-mine">💣</span>
                  )}
                  {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 && (
                    <span
                      className="minesweeper-number"
                      style={{ color: getCellColor(cell.adjacentMines) }}
                    >
                      {cell.adjacentMines}
                    </span>
                  )}
                  {cell.isFlagged && !cell.isRevealed && (
                    <Flag size={14} className="minesweeper-flag-icon" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {(gameOver || gameWon) && (
          <div className="minesweeper-game-over">
            <div className="minesweeper-game-over-title">
              {gameWon ? '🎉 You Won!' : '💥 Game Over'}
            </div>
            <Button variant="primary" onClick={resetGame} size="lg">
              <RotateCw size={18} style={{ marginRight: 8 }} />
              Play Again
            </Button>
          </div>
        )}

        <div className="minesweeper-controls">
          <Button variant="ghost" onClick={resetGame} size="md">
            <RotateCw size={16} style={{ marginRight: 8 }} />
            Reset
          </Button>
        </div>

        <div className="minesweeper-instructions">
          <div className="minesweeper-instructions-title">Controls</div>
          <div className="minesweeper-instructions-list">
            <span>Click</span> to reveal • <span>Right-click</span> to flag
          </div>
        </div>
      </div>
    </div>
  );
};

