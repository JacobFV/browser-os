import React from 'react';
import './AISettings.css';

export interface AISettingsProps {
  difficulty: number;
  onDifficultyChange: (difficulty: number) => void;
  showEvaluation?: boolean;
  onShowEvaluationChange?: (show: boolean) => void;
}

const difficultyLabels = [
  'Beginner',
  'Novice',
  'Casual',
  'Intermediate',
  'Advanced',
  'Expert',
  'Master',
  'Grandmaster',
  'World Class',
  'Superhuman',
];

export const AISettings: React.FC<AISettingsProps> = ({
  difficulty,
  onDifficultyChange,
  showEvaluation = false,
  onShowEvaluationChange,
}) => {
  const estimatedElo = Math.floor(800 + (difficulty - 1) * 150);

  return (
    <div className="ai-settings">
      <h3>AI Settings</h3>
      
      <div className="setting-group">
        <label htmlFor="difficulty-slider">
          Difficulty: {difficultyLabels[difficulty - 1] || `Level ${difficulty}`}
        </label>
        <input
          id="difficulty-slider"
          type="range"
          min="1"
          max="10"
          value={difficulty}
          onChange={(e) => onDifficultyChange(parseInt(e.target.value, 10))}
          className="difficulty-slider"
        />
        <div className="difficulty-info">
          <span>Estimated ELO: ~{estimatedElo}</span>
        </div>
      </div>

      {onShowEvaluationChange && (
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showEvaluation}
              onChange={(e) => onShowEvaluationChange(e.target.checked)}
            />
            Show AI evaluation
          </label>
        </div>
      )}
    </div>
  );
};

