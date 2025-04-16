import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

const ForecastChart = ({ currentKp }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Get color based on Kp index
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

  // Generate 24 hours of "forecast" data based on the current Kp value
  // This is just for demonstration - a real forecast would use actual prediction data
  const generateForecastData = (currentKp) => {
    const hours = 24;
    const variation = 1.5; // Maximum random variation
    const labels = [];
    const data = [];
    const backgroundColor = [];
    
    for (let i = 0; i < hours; i++) {
      // Generate a somewhat realistic variation based on current Kp
      const randomFactor = (Math.random() * 2 - 1) * variation;
      const predictedKp = Math.max(0, Math.min(9, currentKp + randomFactor));
      
      labels.push(`${i}h`);
      data.push(predictedKp);
      backgroundColor.push(getKpColor(predictedKp));
    }

    return { labels, data, backgroundColor };
  };

  useEffect(() => {
    if (currentKp !== null && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      // Destroy previous chart if exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      
      const { labels, data, backgroundColor } = generateForecastData(currentKp);
      
      // Create new chart
      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Predicted Kp Index',
            data: data,
            backgroundColor: backgroundColor,
            borderColor: backgroundColor,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 9,
              title: {
                display: true,
                text: 'Kp Index',
                color: '#f5f5f5'
              },
              ticks: {
                color: '#f5f5f5'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Hours from now',
                color: '#f5f5f5'
              },
              ticks: {
                color: '#f5f5f5'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#f5f5f5'
              }
            },
            tooltip: {
              callbacks: {
                title: function(tooltipItems) {
                  return 'Forecast: ' + tooltipItems[0].label;
                },
                label: function(context) {
                  return `Kp Index: ${context.raw.toFixed(1)}`;
                }
              }
            }
          }
        }
      });
    }
  
    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [currentKp]);

  return (
    <div className="forecast-container">
      <h2>24-Hour Forecast</h2>
      <div className="forecast-chart">
        <canvas ref={chartRef}></canvas>
      </div>
      <p className="forecast-disclaimer">
        Note: This is a simplified forecast for demonstration purposes.
      </p>
    </div>
  );
};

export default ForecastChart;
