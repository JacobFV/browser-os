import { useState, useCallback, useEffect, useRef } from 'react';
import type { Square } from 'chess.js';
import type { ChessGameEngine } from '../engine/ChessGameEngine';
import { ChessClient } from '../network/ChessClient';
import { Matchmaking } from '../network/Matchmaking';

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
}

export interface UseOnlineGameOptions {
  engine: ChessGameEngine;
  gameId?: string;
  playerId?: string;
  playerColor?: 'w' | 'b';
  onMove: (from: Square, to: Square) => void;
  onGameOver?: (result: string) => void;
  enabled: boolean;
  serverUrl?: string;
}

export function useOnlineGame(options: UseOnlineGameOptions) {
  const { engine, gameId, playerId, playerColor, onMove, onGameOver, enabled, serverUrl = 'ws://localhost:8000' } = options;
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const matchmakingRef = useRef<Matchmaking | null>(null);
  const clientRef = useRef<ChessClient | null>(null);

  const connect = useCallback(async (serverUrlParam?: string) => {
    if (!enabled) return;
    
    const url = serverUrlParam || serverUrl;
    setConnectionStatus('connecting');

    try {
      const matchmaking = new Matchmaking({
        serverUrl: url,
        playerId: playerId || `player_${Date.now()}`,
      });

      matchmakingRef.current = matchmaking;
      clientRef.current = matchmaking.getClient();

      clientRef.current.setCallbacks({
        onMove: (move) => {
          if (move && move.length >= 4) {
            const from = move.substring(0, 2) as Square;
            const to = move.substring(2, 4) as Square;
            onMove(from, to);
          }
        },
        onChat: (sender, message) => {
          setChatMessages((prev) => [...prev, {
            id: `${Date.now()}-${Math.random()}`,
            sender,
            message,
            timestamp: Date.now(),
          }]);
        },
        onGameOver: (result) => {
          if (onGameOver) {
            onGameOver(result);
          }
        },
        onJoined: () => {
          setConnectionStatus('connected');
        },
        onError: (error) => {
          console.error('[useOnlineGame] Error:', error);
          setConnectionStatus('disconnected');
        },
      });

      await clientRef.current.connect();
      
      if (gameId) {
        clientRef.current.joinGame(gameId);
      } else {
        clientRef.current.joinGame();
      }
    } catch (error) {
      console.error('[useOnlineGame] Failed to connect:', error);
      setConnectionStatus('disconnected');
    }
  }, [enabled, serverUrl, playerId, gameId, onMove, onGameOver]);

  const disconnect = useCallback(() => {
    if (matchmakingRef.current) {
      matchmakingRef.current.disconnect();
      matchmakingRef.current = null;
    }
    clientRef.current = null;
    setConnectionStatus('disconnected');
  }, []);

  const sendMove = useCallback((from: Square, to: Square) => {
    if (clientRef.current) {
      clientRef.current.sendMove(from, to);
    }
  }, []);

  const sendChatMessage = useCallback((message: string) => {
    if (clientRef.current) {
      clientRef.current.sendChatMessage(message);
    }
  }, []);

  const resign = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.resign();
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionStatus,
    chatMessages,
    connect,
    disconnect,
    sendMove,
    sendChatMessage,
    resign,
  };
}

