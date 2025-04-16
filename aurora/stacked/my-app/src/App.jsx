import { useState, useEffect } from 'react';
import './App.css';

// Components
import LocationInput from './components/LocationInput';
import KpIndex from './components/KpIndex';
import VisibilityScore from './components/VisibilityScore';
import ForecastChart from './components/ForecastChart';
import AuroraMap from './components/AuroraMap';
import LightPollution from './components/LightPollution';

// Services
import { 
  fetchCurrentKpIndex, 
  calculateVisibilityChance 
} from './services/auroraService';

function App() {
  // State for aurora data
  const [coordinates, setCoordinates] = useState(null);
  const [kpIndex, setKpIndex] = useState(null);
  const [visibilityChance, setVisibilityChance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  // Handle location submission
  const handleLocationSubmit = async (latitude, longitude) => {
    setCoordinates({ latitude, longitude });
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch Kp index from NOAA
      const currentKp = await fetchCurrentKpIndex();
      
      // Set Kp index
      setKpIndex(currentKp);
      
      // Calculate visibility chance
      const visibility = calculateVisibilityChance(currentKp, latitude);
      setVisibilityChance(visibility);
      
      setDataFetched(true);
    } catch (err) {
      setError(`Error fetching aurora data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Aurora Forecast</h1>
        <p>Check the current aurora activity at your location</p>
      </header>
      
      <main>
        {/* Location Input Section */}
        <LocationInput onLocationSubmit={handleLocationSubmit} />
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching aurora data...</p>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        {/* Aurora Data Display */}
        {dataFetched && !isLoading && !error && (
          <div className="aurora-data">
            {/* Location Display */}
            <div className="current-location">
              <h2>Current Location</h2>
              <p className="coordinates">
                Latitude: <span>{coordinates.latitude.toFixed(4)}</span> | 
                Longitude: <span>{coordinates.longitude.toFixed(4)}</span>
              </p>
            </div>
            
            {/* Kp Index Display */}
            <KpIndex kpValue={kpIndex} />
            
            {/* Visibility Score */}
            <VisibilityScore visibilityChance={visibilityChance} />
            
            {/* Forecast Chart */}
            <ForecastChart currentKp={kpIndex} />
            
            {/* Aurora Map */}
            <AuroraMap coordinates={coordinates} kpIndex={kpIndex} />
            
            {/* Light Pollution Analysis */}
            <LightPollution coordinates={coordinates} />
          </div>
        )}
      </main>
      
      <footer>
        <p>Data provided by <a href="https://www.spaceweatherlive.com" target="_blank" rel="noopener noreferrer">SpaceWeatherLive</a> and <a href="https://www.swpc.noaa.gov" target="_blank" rel="noopener noreferrer">NOAA SWPC</a></p>
        <p>This is a demo project and not meant for scientific or navigation purposes.</p>
      </footer>
    </div>
  );
}

export default App;
