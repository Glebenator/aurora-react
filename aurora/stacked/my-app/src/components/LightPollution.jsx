import React, { useEffect, useState } from 'react';
import { calculateLightPollution } from '../services/lightPollutionService';

const LightPollution = ({ coordinates }) => {
  const [pollutionData, setPollutionData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coordinates) {
      setLoading(true);
      // Using setTimeout to simulate an API call
      setTimeout(() => {
        const data = calculateLightPollution(coordinates.latitude, coordinates.longitude);
        setPollutionData(data);
        setLoading(false);
      }, 500);
    } else {
      setPollutionData(null);
    }
  }, [coordinates]);

  // Get color based on pollution level
  const getPollutionColor = (value) => {
    if (value < 10) {
      return '#4caf50'; // Green - excellent
    } else if (value < 30) {
      return '#8bc34a'; // Light green - good
    } else if (value < 60) {
      return '#ffc107'; // Amber - moderate
    } else if (value < 80) {
      return '#ff9800'; // Orange - high
    } else {
      return '#f44336'; // Red - severe
    }
  };

  if (!coordinates) {
    return null;
  }

  return (
    <div className="light-pollution-container">
      <h2>Light Pollution Analysis</h2>
      
      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Analyzing light pollution data...</p>
        </div>
      ) : pollutionData ? (
        <>
          <div className="pollution-meter">
            <div className="pollution-value" style={{ color: getPollutionColor(pollutionData.value) }}>
              {pollutionData.value}%
            </div>
            <div className="pollution-level">{pollutionData.level}</div>
          </div>

          <div className="pollution-details">
            <p className="pollution-description">{pollutionData.description}</p>
            
            {pollutionData.closestCity && (
              <p className="city-info">
                Nearest major city: {pollutionData.closestCity.name} 
                ({Math.round(pollutionData.closestCity.distance)} km away)
              </p>
            )}
            
            {pollutionData.tips && (
              <div className="pollution-tips">
                <h4>Viewing Tips</h4>
                <p>{pollutionData.tips}</p>
              </div>
            )}
          </div>

          <div className="pollution-scale">
            <div className="scale-gradient"></div>
            <div className="scale-labels">
              <span>Dark Sky</span>
              <span>Urban Sky</span>
            </div>
          </div>
        </>
      ) : (
        <p>No light pollution data available.</p>
      )}

      <p className="pollution-disclaimer">
        This is a simplified model based on proximity to major cities and population density.
        For the most accurate light pollution data, consult the Dark Sky Finder or similar tools.
      </p>
    </div>
  );
};

export default LightPollution;
