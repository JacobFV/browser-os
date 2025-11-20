import React, { useState, useEffect } from 'react';
import type { Square } from 'chess.js';
import { ChessBoard } from './components/ChessBoard';
import { MoveList } from './components/MoveList';
import { GameControls } from './components/GameControls';
import { GameStatusComponent } from './components/GameStatus';
import { AISettings } from './components/AISettings';
import { ChatPanel } from './components/ChatPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { useChessGame, type GameMode } from './state/useChessGame';
import { useAIOpponent } from './state/useAIOpponent';
import { useOnlineGame } from './state/useOnlineGame';
import { useGameSettings } from './state/useGameSettings';
import { exportToPgn, saveGameToStorage, loadGameFromStorage, listSavedGames } from './utils/gamePersistence';
import { setSoundsEnabled } from './utils/soundEffects';
import type { EventBus } from '@browser-os/events';
import './Chess.css';

export interface ChessProps {
  windowId?: string;
  appId?: string;
  eventBus?: EventBus;
}

export const Chess: React.FC<ChessProps> = ({ windowId, appId, eventBus }) => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState(5);
  const [showSidebar, setShowSidebar] = useState(true);
  const [serverUrl, setServerUrl] = useState('ws://localhost:8000');
  const [gameId, setGameId] = useState<string | undefined>();
  const [playerId] = useState(() => `player_${Date.now()}`);
  const [matchmakingWindowId, setMatchmakingWindowId] = useState<string | null>(null);

  const settings = useGameSettings();
  
  // Update sounds enabled when settings change
  React.useEffect(() => {
    setSoundsEnabled(settings.settings.soundsEnabled);
  }, [settings.settings.soundsEnabled]);

  const {
    engine,
    gameState,
    board,
    turn,
    status,
    metadata,
    selectedSquare,
    legalMoves,
    lastMove,
    handleSquareClick,
    handlePieceMove,
    undo,
    redo,
    reset,
    makeMoveFromNotation,
    canUndo,
    canRedo,
  } = useChessGame({
    mode: gameMode || 'local',
    onMove: (move) => {
      if (gameMode === 'online' && onlineGame.sendMove) {
        onlineGame.sendMove(move.from, move.to);
      }
    },
    onGameOver: (result) => {
      console.log('Game over:', result);
    },
  });

  const aiOpponent = useAIOpponent({
    engine,
    difficulty: aiDifficulty,
    enabled: gameMode === 'ai',
    onMove: (from, to) => {
      handlePieceMove(from, to);
    },
  });

  // Initialize online game when gameId is set
  const onlineGame = useOnlineGame({
    engine,
    gameId,
    playerId,
    playerColor: 'w', // TODO: Get from server
    onMove: (from, to) => {
      makeMoveFromNotation(`${from}${to}`);
    },
    enabled: gameMode === 'online' && !!gameId,
  });

  // Connect when gameId is available
  useEffect(() => {
    if (gameMode === 'online' && gameId && !onlineGame.connectionStatus) {
      onlineGame.connect(serverUrl);
    }
  }, [gameMode, gameId, serverUrl]);

  const handleNewGame = () => {
    reset();
    if (gameMode === 'online') {
      // TODO: Create new game on server
    }
  };

  const handleResign = () => {
    if (gameMode === 'online') {
      onlineGame.resign();
    } else {
      engine.resign(turn);
    }
  };

  const handleSave = () => {
    const state = gameState.exportState(gameMode, gameId);
    const saveKey = `game_${Date.now()}`;
    saveGameToStorage(saveKey, state);
    alert('Game saved!');
  };

  const handleLoad = () => {
    const savedGames = listSavedGames();
    if (savedGames.length === 0) {
      alert('No saved games found');
      return;
    }
    // Simple: load the most recent game
    const latestGame = savedGames[savedGames.length - 1];
    const state = loadGameFromStorage(latestGame);
    if (state) {
      gameState.importState(state);
      setGameMode(state.gameMode);
      if (state.gameId) {
        setGameId(state.gameId);
      }
    }
  };

  const handleExportPgn = () => {
    const pgn = exportToPgn(engine, {
      white: metadata.whitePlayer,
      black: metadata.blackPlayer,
    });
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess_game_${Date.now()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSquareClickWithMode = (square: Square) => {
    if (gameMode === 'online' && turn !== 'w') {
      // Not player's turn in online mode
      return;
    }
    if (gameMode === 'ai' && turn === 'b') {
      // AI's turn
      return;
    }
    handleSquareClick(square);
  };

  const handlePieceMoveWithMode = (from: Square, to: Square) => {
    if (gameMode === 'online' && turn !== 'w') {
      return;
    }
    if (gameMode === 'ai' && turn === 'b') {
      return;
    }
    handlePieceMove(from, to);
  };

  const openSettingsWindow = () => {
    if (eventBus) {
      eventBus.emit('taskbar:shortcut:clicked', {
        appId: 'chess-settings',
        forceNew: true,
      }, { source: 'chess' });
    } else {
      // Fallback if no eventBus
      console.warn('EventBus not available, cannot open settings window');
    }
  };

  const openMatchmakingWindow = () => {
    if (eventBus) {
      eventBus.emit('taskbar:shortcut:clicked', {
        appId: 'chess-matchmaking',
        forceNew: true,
      }, { source: 'chess' });
    } else {
      // Fallback if no eventBus - open matchmaking in current window
      setGameMode('online');
      setTimeout(() => onlineGame.connect(serverUrl), 100);
    }
  };

  // Listen for match found event (must be before early return)
  useEffect(() => {
    if (!eventBus) return;

    const handleMatchFound = (event: any) => {
      const { gameId: foundGameId, color } = event.payload || {};
      if (foundGameId) {
        setGameId(foundGameId);
        setGameMode('online');
        // Close matchmaking window if open
        if (matchmakingWindowId && eventBus) {
          eventBus.emit('window:close', { windowId: matchmakingWindowId }, { source: 'chess' });
        }
      }
    };

    const unsubscribe = eventBus.on('chess:matchFound', handleMatchFound);
    return () => {
      unsubscribe();
    };
  }, [eventBus, matchmakingWindowId]);

  // Show mode selection if no mode is selected
  if (gameMode === null) {
    return (
      <div className="chess-app">
        <div className="mode-selection-screen">
          <h1>Chess</h1>
          <p>Select a game mode to begin</p>
          <div className="mode-buttons">
            <button
              className="mode-button"
              onClick={() => setGameMode('local')}
            >
              <div className="mode-icon">👥</div>
              <div className="mode-title">Local Multiplayer</div>
              <div className="mode-description">Play against a friend on the same screen</div>
            </button>
            <button
              className="mode-button"
              onClick={() => setGameMode('ai')}
            >
              <div className="mode-icon">🤖</div>
              <div className="mode-title">vs AI</div>
              <div className="mode-description">Challenge the computer</div>
            </button>
            <button
              className="mode-button"
              onClick={openMatchmakingWindow}
            >
              <div className="mode-icon">🌐</div>
              <div className="mode-title">Online Multiplayer</div>
              <div className="mode-description">Play against players online</div>
            </button>
          </div>
          <button 
            className="settings-button"
            onClick={openSettingsWindow}
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chess-app">
      <div className="chess-header">
        <h1>Chess</h1>
        <div className="chess-header-actions">
          {(gameMode === 'local' || gameMode === 'ai') && (
            <button onClick={handleNewGame} className="header-button">
              Reset Game
            </button>
          )}
          <button onClick={openSettingsWindow} className="header-button">
            ⚙️ Settings
          </button>
          <button 
            onClick={() => setShowSidebar(!showSidebar)} 
            className="header-button"
            title="Toggle sidebar"
          >
            {showSidebar ? '◀' : '▶'}
          </button>
        </div>
      </div>

      <div className="chess-content">
        <div className="chess-main">
          <div className="board-container">
            <ChessBoard
              engine={engine}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              onSquareClick={handleSquareClickWithMode}
              onPieceMove={handlePieceMoveWithMode}
              disabled={
                (gameMode === 'online' && turn !== 'w') ||
                (gameMode === 'ai' && turn === 'b') ||
                status !== 'active' && status !== 'check'
              }
            />
            {aiOpponent.isThinking && (
              <div className="ai-thinking">
                AI is thinking...
              </div>
            )}
          </div>

          <GameStatusComponent
            status={status}
            result={metadata.result || null}
            currentTurn={turn}
            isOnline={gameMode === 'online'}
            connectionStatus={onlineGame.connectionStatus}
            whitePlayer={metadata.whitePlayer || 'White'}
            blackPlayer={metadata.blackPlayer || 'Black'}
          />

          <GameControls
            onNewGame={handleNewGame}
            onUndo={undo}
            onRedo={redo}
            onResign={handleResign}
            onSave={handleSave}
            onLoad={handleLoad}
            onExportPgn={handleExportPgn}
            canUndo={canUndo}
            canRedo={canRedo}
            disabled={status !== 'active' && status !== 'check'}
          />
        </div>

        {showSidebar && (
          <div className="chess-sidebar">
            <MoveList
              moves={engine.getHistory()}
              currentMoveIndex={engine.getHistory().length - 1}
            />

            {gameMode === 'ai' && (
              <AISettings
                difficulty={aiDifficulty}
                onDifficultyChange={setAiDifficulty}
              />
            )}

            {gameMode === 'online' && settings.settings.chatEnabled && (
              <ChatPanel
                messages={onlineGame.chatMessages}
                onSendMessage={onlineGame.sendChatMessage}
                currentPlayer={playerId}
                enabled={settings.settings.chatEnabled}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
