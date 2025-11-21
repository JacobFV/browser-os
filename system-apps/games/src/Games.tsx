import React, { useState } from 'react';
import { Snake } from './Snake';
import { Minesweeper } from './Minesweeper';
import './Games.css';

type GameId = 'snake' | 'minesweeper';

interface GameInfo {
  id: GameId;
  name: string;
  description: string;
  icon: string;
}

const GAMES: GameInfo[] = [
  {
    id: 'snake',
    name: 'Snake',
    description: 'Classic snake game. Eat food and grow!',
    icon: '🐍',
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    description: 'Find all mines without detonating them.',
    icon: '💣',
  },
];

export const Games: React.FC<{ os: any }> = ({ os }) => {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  const handleGameSelect = (gameId: GameId) => {
    setActiveGame(gameId);
  };

  const handleBack = () => {
    setActiveGame(null);
  };

  if (activeGame) {
    return (
      <div className="games-app">
        <div className="games-header">
          <button className="games-back-button" onClick={handleBack}>
            ← Back
          </button>
          <div className="games-title">
            {GAMES.find(g => g.id === activeGame)?.name}
          </div>
          <div></div>
        </div>
        <div className="games-content">
          <div className="games-game-view">
            {activeGame === 'snake' && <Snake />}
            {activeGame === 'minesweeper' && <Minesweeper />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="games-app">
      <div className="games-header">
        <div className="games-title">Games</div>
      </div>
      <div className="games-content">
        <div className="games-grid">
          {GAMES.map(game => (
            <div
              key={game.id}
              className="games-card"
              onClick={() => handleGameSelect(game.id)}
            >
              <div className="games-card-icon">{game.icon}</div>
              <div className="games-card-name">{game.name}</div>
              <div className="games-card-description">{game.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
