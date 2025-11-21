import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCw } from 'lucide-react';
import { Button } from '@browser-os/ui';
import './Snake.css';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = 'right';
const GAME_SPEED = 120;

interface SnakeGameState {
  snake: Array<{ x: number; y: number }>;
  food: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  score: number;
  gameOver: boolean;
  isPaused: boolean;
}

const generateFood = (snake: Array<{ x: number; y: number }>): { x: number; y: number } => {
  let food: { x: number; y: number };
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

export const Snake: React.FC = () => {
  const [gameState, setGameState] = useState<SnakeGameState>({
    snake: INITIAL_SNAKE,
    food: generateFood(INITIAL_SNAKE),
    direction: INITIAL_DIRECTION,
    score: 0,
    gameOver: false,
    isPaused: false,
  });

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef(INITIAL_DIRECTION);
  const highScoreRef = useRef(0);

  const resetGame = useCallback(() => {
    const newSnake = INITIAL_SNAKE;
    const newFood = generateFood(newSnake);
    setGameState({
      snake: newSnake,
      food: newFood,
      direction: INITIAL_DIRECTION,
      score: 0,
      gameOver: false,
      isPaused: false,
    });
    directionRef.current = INITIAL_DIRECTION;
  }, []);

  const moveSnake = useCallback(() => {
    setGameState(prev => {
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
        if (prev.score > highScoreRef.current) {
          highScoreRef.current = prev.score;
        }
        return { ...prev, gameOver: true };
      }

      // Check self collision
      if (prev.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        if (prev.score > highScoreRef.current) {
          highScoreRef.current = prev.score;
        }
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
    if (!gameState.gameOver && !gameState.isPaused) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
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
  }, [gameState.gameOver, gameState.isPaused, moveSnake]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState.gameOver) return;

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
    } else if (key === ' ' || key === 'p') {
      e.preventDefault();
      setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    }
  }, [gameState.gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const togglePause = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  return (
    <div className="snake-game">
      <div className="snake-stats">
        <div className="snake-stat">
          <div className="snake-stat-label">Score</div>
          <div className="snake-stat-value">{gameState.score}</div>
        </div>
        <div className="snake-stat">
          <div className="snake-stat-label">Length</div>
          <div className="snake-stat-value">{gameState.snake.length}</div>
        </div>
        {highScoreRef.current > 0 && (
          <div className="snake-stat">
            <div className="snake-stat-label">Best</div>
            <div className="snake-stat-value">{highScoreRef.current}</div>
          </div>
        )}
      </div>

      <div className="snake-board-container">
        <div className="snake-board">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const isSnake = gameState.snake.some(seg => seg.x === x && seg.y === y);
            const isHead = gameState.snake[0].x === x && gameState.snake[0].y === y;
            const isFood = gameState.food.x === x && gameState.food.y === y;

            return (
              <div
                key={index}
                className={`snake-cell ${
                  isSnake ? (isHead ? 'head' : 'body') : isFood ? 'food' : ''
                }`}
              />
            );
          })}
        </div>
      </div>

      {gameState.gameOver ? (
        <div className="snake-game-over">
          <div className="snake-game-over-title">Game Over!</div>
          <div className="snake-game-over-score">Final Score: {gameState.score}</div>
          {highScoreRef.current > 0 && gameState.score === highScoreRef.current && (
            <div className="snake-new-record">New Record! 🎉</div>
          )}
          <Button variant="primary" onClick={resetGame} size="lg">
            <RotateCw size={18} style={{ marginRight: 8 }} />
            Play Again
          </Button>
        </div>
      ) : (
        <div className="snake-controls">
          <Button
            variant="secondary"
            onClick={togglePause}
            size="md"
          >
            {gameState.isPaused ? (
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
            Restart
          </Button>
        </div>
      )}

      {gameState.isPaused && !gameState.gameOver && (
        <div className="snake-pause-overlay">
          <div className="snake-pause-text">Paused</div>
        </div>
      )}

      <div className="snake-instructions">
        <div className="snake-instructions-title">Controls</div>
        <div className="snake-instructions-list">
          <span>Arrow Keys</span> to move • <span>Space/P</span> to pause
        </div>
      </div>
    </div>
  );
};

