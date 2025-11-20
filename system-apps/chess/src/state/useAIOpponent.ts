import { useState, useEffect, useCallback, useRef } from 'react';
import { AIController } from '../engine/AIController';
import type { ChessGameEngine } from '../engine/ChessGameEngine';
import type { Square } from 'chess.js';

export interface UseAIOpponentOptions {
  engine: ChessGameEngine;
  difficulty: number;
  enabled: boolean;
  onMove: (from: Square, to: Square) => void;
}

export function useAIOpponent(options: UseAIOpponentOptions) {
  const { engine, difficulty, enabled, onMove } = options;
  const [isThinking, setIsThinking] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<number | null>(null);
  const aiControllerRef = useRef<AIController | null>(null);

  // Initialize AI controller
  useEffect(() => {
    if (enabled) {
      aiControllerRef.current = new AIController({ difficulty });
      return () => {
        aiControllerRef.current?.destroy();
      };
    }
  }, [enabled, difficulty]);

  // Update difficulty when it changes
  useEffect(() => {
    if (aiControllerRef.current) {
      aiControllerRef.current.setDifficulty(difficulty);
    }
  }, [difficulty]);

  const makeAIMove = useCallback(async () => {
    if (!enabled || !aiControllerRef.current || engine.getTurn() === 'w') {
      return;
    }

    setIsThinking(true);
    try {
      const result = await aiControllerRef.current.getBestMove(engine);
      
      // Parse move notation (e.g., "e2e4" or "e7e5")
      if (result.move && result.move.length >= 4) {
        const from = result.move.substring(0, 2) as Square;
        const to = result.move.substring(2, 4) as Square;
        
        if (engine.isLegalMove(from, to)) {
          onMove(from, to);
        }
      }
      
      if (result.evaluation !== undefined) {
        setAiEvaluation(result.evaluation);
      }
    } catch (error) {
      console.error('AI move error:', error);
    } finally {
      setIsThinking(false);
    }
  }, [enabled, engine, onMove]);

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (enabled && engine.getTurn() === 'b' && !engine.isGameOver()) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500); // Small delay for UI updates
      return () => clearTimeout(timer);
    }
  }, [enabled, engine.getTurn(), engine.getFen(), makeAIMove]);

  return {
    isThinking,
    aiEvaluation,
    makeAIMove,
  };
}

