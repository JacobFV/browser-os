import React, { useState, useEffect } from 'react';
import { Matchmaking } from '../network/Matchmaking';
import type { EventBus } from '@browser-os/events';
import './MatchmakingWindow.css';

export interface MatchmakingWindowProps {
  windowId?: string;
  appId?: string;
  eventBus?: EventBus;
}

export const MatchmakingWindow: React.FC<MatchmakingWindowProps> = ({ windowId, appId, eventBus }) => {
  const [serverUrl] = useState('ws://localhost:8000');
  const [playerId] = useState(() => `player_${Date.now()}`);
  const [playerName, setPlayerName] = useState('Player');
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [matchmaking, setMatchmaking] = useState<Matchmaking | null>(null);

  useEffect(() => {
    return () => {
      if (matchmaking) {
        matchmaking.disconnect();
      }
    };
  }, [matchmaking]);

  const startMatchmaking = async () => {
    setStatus('searching');
    setError(null);

    try {
      const mm = new Matchmaking({
        serverUrl,
        playerId,
        playerName,
      });

      mm.getClient().setCallbacks({
        onJoined: (gameId, color) => {
          setStatus('found');
          // Emit event to open chess board window
          if (eventBus) {
            eventBus.emit('chess:matchFound', {
              gameId,
              color,
            }, { source: 'chess-matchmaking' });
            // Create new chess board window
            setTimeout(() => {
              eventBus.emit('taskbar:shortcut:clicked', {
                appId: 'chess',
                forceNew: true,
                args: { gameId, color },
              }, { source: 'chess-matchmaking' });
            }, 500);
          }
        },
        onError: (err) => {
          setError(err);
          setStatus('error');
        },
      });

      setMatchmaking(mm);
      await mm.findGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start matchmaking');
      setStatus('error');
    }
  };

  const cancelMatchmaking = () => {
    if (matchmaking) {
      matchmaking.disconnect();
      setMatchmaking(null);
    }
    setStatus('idle');
    setError(null);
  };

  return (
    <div className="matchmaking-window">
      <h1>Find a Match</h1>
      
      <div className="matchmaking-content">
        <div className="matchmaking-form">
          <label>
            Player Name:
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={status === 'searching'}
              placeholder="Enter your name"
            />
          </label>
        </div>

        {status === 'idle' && (
          <button className="matchmaking-button primary" onClick={startMatchmaking}>
            Find Match
          </button>
        )}

        {status === 'searching' && (
          <div className="matchmaking-status">
            <div className="spinner"></div>
            <p>Searching for opponent...</p>
            <button className="matchmaking-button" onClick={cancelMatchmaking}>
              Cancel
            </button>
          </div>
        )}

        {status === 'found' && (
          <div className="matchmaking-status">
            <p>Match found! Opening game...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="matchmaking-error">
            <p>Error: {error || 'Unknown error'}</p>
            <button className="matchmaking-button" onClick={() => setStatus('idle')}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

