import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCw } from 'lucide-react';
import './Games.css';

type Game = 'snake' | 'minesweeper';

interface SnakeGameState {
  snake: Array<{ x: number; y: number }>;
  food: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  score: number;
  gameOver: boolean;
  isPaused: boolean;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = 'right';

const generateFood = (snake: Array<{ x: number; y: number }>): { x: number; y: number } => {
  let food;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

export const Games: React.FC<{ os: any }> = ({ os }) => {
  const [activeGame, setActiveGame] = useState<Game>('snake');
  const [snakeState, setSnakeState] = useState<SnakeGameState>({
    snake: INITIAL_SNAKE,
    food: generateFood(INITIAL_SNAKE),
    direction: INITIAL_DIRECTION,
    score: 0,
    gameOver: false,
    isPaused: false,
  });

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef(INITIAL_DIRECTION);

  const resetSnakeGame = () => {
    const newSnake = INITIAL_SNAKE;
    setSnakeState({
      snake: newSnake,
      food: generateFood(newSnake),
      direction: INITIAL_DIRECTION,
      score: 0,
      gameOver: false,
      isPaused: false,
    });
    directionRef.current = INITIAL_DIRECTION;
  };

  const moveSnake = useCallback(() => {
    setSnakeState(prev => {
      if (prev.gameOver || prev.isPaused) return prev;

      const head = { ...prev.snake[0] };
      const direction = directionRef.current;

      switch (direction) {
        case 'up':
          head.y -= 1;
          break;
        case 'down':
          head.y += 1;
          break;
        case 'left':
          head.x -= 1;
          break;
        case 'right':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return { ...prev, gameOver: true };
      }

      // Check self collision
      if (prev.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return { ...prev, gameOver: true };
      }

      const newSnake = [head, ...prev.snake];

      // Check food collision
      if (head.x === prev.food.x && head.y === prev.food.y) {
        const newFood = generateFood(newSnake);
        return {
          ...prev,
          snake: newSnake,
          food: newFood,
          score: prev.score + 10,
        };
      }

      // Move snake
      newSnake.pop();
      return {
        ...prev,
        snake: newSnake,
      };
    });
  }, []);

  useEffect(() => {
    if (activeGame === 'snake' && !snakeState.gameOver && !snakeState.isPaused) {
      gameLoopRef.current = setInterval(moveSnake, 150);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [activeGame, snakeState.gameOver, snakeState.isPaused, moveSnake]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (activeGame !== 'snake' || snakeState.gameOver) return;

    const key = e.key.toLowerCase();
    const currentDir = directionRef.current;

    if (key === 'arrowup' && currentDir !== 'down') {
      directionRef.current = 'up';
    } else if (key === 'arrowdown' && currentDir !== 'up') {
      directionRef.current = 'down';
    } else if (key === 'arrowleft' && currentDir !== 'right') {
      directionRef.current = 'left';
    } else if (key === 'arrowright' && currentDir !== 'left') {
      directionRef.current = 'right';
    } else if (key === ' ') {
      e.preventDefault();
      setSnakeState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    }
  }, [activeGame, snakeState.gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const togglePause = () => {
    setSnakeState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  return (
    <div className="games-app">
      <div className="games-header">
        <div className="games-title">Games</div>
      </div>

      <div className="games-content">
        <div className="games-sidebar">
          <div
            className={`game-item ${activeGame === 'snake' ? 'active' : ''}`}
            onClick={() => {
              setActiveGame('snake');
              resetSnakeGame();
            }}
          >
            <div className="game-name">Snake</div>
            <div className="game-description">Classic snake game</div>
          </div>
        </div>

        <div className="game-view">
          {activeGame === 'snake' && (
            <div className="snake-game">
              <div className="game-stats">
                <div className="stat-item">
                  <div className="stat-label">Score</div>
                  <div className="stat-value">{snakeState.score}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Length</div>
                  <div className="stat-value">{snakeState.snake.length}</div>
                </div>
              </div>

              <div className="snake-board">
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                  const x = index % GRID_SIZE;
                  const y = Math.floor(index / GRID_SIZE);
                  const isSnake = snakeState.snake.some(seg => seg.x === x && seg.y === y);
                  const isHead = snakeState.snake[0].x === x && snakeState.snake[0].y === y;
                  const isFood = snakeState.food.x === x && snakeState.food.y === y;

                  return (
                    <div
                      key={index}
                      className={`snake-cell ${
                        isSnake ? (isHead ? 'head' : 'snake') : isFood ? 'food' : ''
                      }`}
                    />
                  );
                })}
              </div>

              {snakeState.gameOver ? (
                <div className="game-over">
                  <div className="game-over-title">Game Over!</div>
                  <div className="game-over-message">Final Score: {snakeState.score}</div>
                  <button className="game-btn" onClick={resetSnakeGame}>
                    <RotateCw size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Play Again
                  </button>
                </div>
              ) : (
                <div className="game-controls">
                  <button className="game-btn" onClick={togglePause}>
                    {snakeState.isPaused ? (
                      <>
                        <Play size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Pause
                      </>
                    )}
                  </button>
                  <button className="game-btn" onClick={resetSnakeGame}>
                    <RotateCw size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Restart
                  </button>
                </div>
              )}

              <div className="instructions">
                <div className="instructions-title">Controls</div>
                <ul className="instructions-list">
                  <li>Arrow Keys: Move</li>
                  <li>Space: Pause/Resume</li>
                  <li>Eat the red food to grow!</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

