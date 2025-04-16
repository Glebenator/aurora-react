import React from 'react';

const KpIndex = ({ kpValue }) => {
  // Determine color based on Kp index
  const getKpColor = (kpIndex) => {
    if (kpIndex >= 7) {
      return '#f44336'; // Red - severe storm
    } else if (kpIndex >= 5) {
      return '#ff9800'; // Orange - strong storm
    } else if (kpIndex >= 3) {
      return '#4caf50'; // Green - moderate activity
    } else {
      return '#4fc3f7'; // Blue - low activity
    }
  };

  return (
    <div className="kp-index-container">
      <h2>Current Kp-Index</h2>
      <div className="kp-meter">
        <div 
          className="kp-value" 
          style={{ color: getKpColor(kpValue) }}
        >
          {kpValue !== null ? kpValue.toFixed(1) : '-'}
        </div>
      </div>
      <div className="kp-scale">
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
        <span>9</span>
      </div>
    </div>
  );
};

export default KpIndex;
