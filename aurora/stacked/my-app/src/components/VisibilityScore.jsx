import React from 'react';

const VisibilityScore = ({ visibilityChance }) => {
  // Get color based on visibility chance
  const getVisibilityColor = (chance) => {
    if (chance >= 70) {
      return '#4caf50'; // Green - high chance
    } else if (chance >= 30) {
      return '#ff9800'; // Orange - moderate chance
    } else {
      return '#f44336'; // Red - low chance
    }
  };

  // Get visibility message based on chance
  const getVisibilityMessage = (chance) => {
    if (chance >= 70) {
      return "High chance of seeing aurora! Get to a dark location away from city lights.";
    } else if (chance >= 30) {
      return "Moderate chance of aurora. Worth looking if skies are clear and you're away from light pollution.";
    } else {
      return "Low chance of seeing aurora at your location. Consider traveling to higher latitudes for better visibility.";
    }
  };

  return (
    <div className="visibility-container">
      <h2>Visibility Chance</h2>
      <div 
        className="visibility-score" 
        style={{ color: getVisibilityColor(visibilityChance) }}
      >
        {visibilityChance !== null ? `${Math.round(visibilityChance)}%` : '-'}
      </div>
      <p className="visibility-message">
        {visibilityChance !== null ? getVisibilityMessage(visibilityChance) : ''}
      </p>
    </div>
  );
};

export default VisibilityScore;
