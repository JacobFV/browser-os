import React, { useState } from 'react';
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
import './Chess.css';

export interface ChessProps {
  windowId?: string;
}

export const Chess: React.FC<ChessProps> = ({ windowId }) => {
  const [gameMode, setGameMode] = useState<GameMode>('local');
  const [aiDifficulty, setAiDifficulty] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [serverUrl, setServerUrl] = useState('ws://localhost:8000');
  const [gameId, setGameId] = useState<string | undefined>();
  const [playerId] = useState(() => `player_${Date.now()}`);

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
    mode: gameMode,
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

  const onlineGame = useOnlineGame({
    engine,
    gameId,
    playerId,
    playerColor: 'w', // TODO: Get from server
    onMove: (from, to) => {
      makeMoveFromNotation(`${from}${to}`);
    },
    enabled: gameMode === 'online',
  });

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

  return (
    <div className="chess-app">
      <div className="chess-header">
        <h1>Chess</h1>
        <div className="mode-selector">
          <button
            className={gameMode === 'local' ? 'active' : ''}
            onClick={() => setGameMode('local')}
          >
            Local
          </button>
          <button
            className={gameMode === 'ai' ? 'active' : ''}
            onClick={() => setGameMode('ai')}
          >
            vs AI
          </button>
          <button
            className={gameMode === 'online' ? 'active' : ''}
            onClick={() => {
              setGameMode('online');
              onlineGame.connect(serverUrl);
            }}
          >
            Online
          </button>
          <button onClick={() => setShowSettings(!showSettings)}>
            ⚙️ Settings
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

          {showSettings && (
            <SettingsPanel
              chatEnabled={settings.settings.chatEnabled}
              onChatEnabledChange={settings.setChatEnabled}
              soundsEnabled={settings.settings.soundsEnabled}
              onSoundsEnabledChange={settings.setSoundsEnabled}
              boardTheme={settings.settings.boardTheme}
              onBoardThemeChange={settings.setBoardTheme}
              pieceSet={settings.settings.pieceSet}
              onPieceSetChange={settings.setPieceSet}
            />
          )}
        </div>
      </div>
    </div>
  );
};
