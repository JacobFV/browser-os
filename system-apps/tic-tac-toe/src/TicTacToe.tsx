import React, { useState, useCallback } from 'react';
import { RotateCw } from 'lucide-react';
import { Button } from '@browser-os/ui';
import './TicTacToe.css';

type Player = 'X' | 'O' | null;
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

const checkWinner = (board: Board): Player => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const checkDraw = (board: Board): boolean => {
  return board.every(cell => cell !== null) && !checkWinner(board);
};

const getBestMove = (board: Board, player: Player): number => {
  // Simple AI: try to win, then block, then take center, then take corner, else random
  const opponent = player === 'X' ? 'O' : 'X';
  
  // Try to win
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const testBoard = [...board];
      testBoard[i] = player;
      if (checkWinner(testBoard) === player) {
        return i;
      }
    }
  }
  
  // Try to block
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      const testBoard = [...board];
      testBoard[i] = opponent;
      if (checkWinner(testBoard) === opponent) {
        return i;
      }
    }
  }
  
  // Take center
  if (!board[4]) return 4;
  
  // Take corners
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => !board[i]);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }
  
  // Random available move
  const available = board.map((cell, i) => !cell ? i : -1).filter(i => i !== -1);
  return available[Math.floor(Math.random() * available.length)];
};

export const TicTacToe: React.FC<{ os?: any }> = ({ os }) => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [gameMode, setGameMode] = useState<'vs-human' | 'vs-ai'>('vs-human');

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner || isDraw || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const newWinner = checkWinner(newBoard);
    const newDraw = checkDraw(newBoard);

    if (newWinner) {
      setWinner(newWinner);
    } else if (newDraw) {
      setIsDraw(true);
    } else {
      const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      
      if (gameMode === 'vs-ai' && nextPlayer === 'O') {
        setIsPlayerTurn(false);
        // AI move
        setTimeout(() => {
          const aiMove = getBestMove(newBoard, 'O');
          const aiBoard = [...newBoard];
          aiBoard[aiMove] = 'O';
          setBoard(aiBoard);
          
          const aiWinner = checkWinner(aiBoard);
          const aiDraw = checkDraw(aiBoard);
          
          if (aiWinner) {
            setWinner(aiWinner);
          } else if (aiDraw) {
            setIsDraw(true);
          } else {
            setCurrentPlayer('X');
            setIsPlayerTurn(true);
          }
        }, 300);
      }
    }
  }, [board, currentPlayer, winner, isDraw, isPlayerTurn, gameMode]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsDraw(false);
    setIsPlayerTurn(true);
  }, []);

  return (
    <div className="tic-tac-toe-app">
      <div className="tic-tac-toe-game">
        <div className="tic-tac-toe-header">
          <div className="tic-tac-toe-mode">
            <select
              value={gameMode}
              onChange={(e) => {
                setGameMode(e.target.value as 'vs-human' | 'vs-ai');
                resetGame();
              }}
              className="tic-tac-toe-mode-select"
              disabled={!isPlayerTurn && !winner && !isDraw}
            >
              <option value="vs-human">vs Human</option>
              <option value="vs-ai">vs AI</option>
            </select>
          </div>
          <div className="tic-tac-toe-status">
            {winner ? (
              <div className="tic-tac-toe-winner">
                {winner} Wins! 🎉
              </div>
            ) : isDraw ? (
              <div className="tic-tac-toe-draw">It's a Draw!</div>
            ) : (
              <div className="tic-tac-toe-turn">
                {gameMode === 'vs-ai' && currentPlayer === 'O' ? "AI's Turn..." : `${currentPlayer}'s Turn`}
              </div>
            )}
          </div>
        </div>

        <div className="tic-tac-toe-board-container">
          <div className="tic-tac-toe-board">
            {board.map((cell, index) => (
              <button
                key={index}
                className={`tic-tac-toe-cell ${cell ? `cell-${cell.toLowerCase()}` : ''} ${
                  !cell && !winner && !isDraw && isPlayerTurn ? 'cell-empty' : ''
                }`}
                onClick={() => handleCellClick(index)}
                disabled={!!cell || !!winner || isDraw || !isPlayerTurn}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>

        <div className="tic-tac-toe-controls">
          <Button variant="primary" onClick={resetGame} size="lg">
            <RotateCw size={18} style={{ marginRight: 8 }} />
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
};

