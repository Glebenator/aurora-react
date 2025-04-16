import { useState } from 'react';

const LocationInput = ({ onLocationSubmit }) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [statusMessage, setStatusMessage] = useState('Click below to get your location or manually enter coordinates');

  // Get user's location using Geolocation API
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setStatusMessage('Accessing your location...');
      
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Update input fields
          setLatitude(lat);
          setLongitude(lng);
          
          setStatusMessage('Location acquired successfully!');
          
          // Send location to parent component
          onLocationSubmit(lat, lng);
        },
        error => {
          handleLocationError(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setStatusMessage('Geolocation is not supported by your browser. Please enter coordinates manually.');
    }
  };

  // Handle submission of manually entered coordinates
  const handleManualSubmit = (e) => {
    e.preventDefault();
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || 
        lat < -90 || lat > 90 || 
        lng < -180 || lng > 180) {
      setStatusMessage('Please enter valid coordinates. Latitude: -90 to 90, Longitude: -180 to 180');
      return;
    }
    
    setStatusMessage('Using provided coordinates');
    onLocationSubmit(lat, lng);
  };

  // Handle geolocation errors
  const handleLocationError = (error) => {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        setStatusMessage('Location access was denied. Please enter coordinates manually or grant permission.');
        break;
      case error.POSITION_UNAVAILABLE:
        setStatusMessage('Location information is unavailable. Please enter coordinates manually.');
        break;
      case error.TIMEOUT:
        setStatusMessage('Location request timed out. Please enter coordinates manually.');
        break;
      case error.UNKNOWN_ERROR:
        setStatusMessage('An unknown error occurred. Please enter coordinates manually.');
        break;
    }
  };

  return (
    <div className="location-container">
      <div id="location-status">
        <p>{statusMessage}</p>
      </div>
      
      <button 
        type="button" 
        className="get-location-btn" 
        onClick={getUserLocation}
      >
        Get My Location
      </button>
      
      <form onSubmit={handleManualSubmit} className="manual-coordinates">
        <input
          type="number"
          id="latitude"
          placeholder="Latitude"
          step="0.0001"
          min="-90"
          max="90"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
        />
        
        <input
          type="number"
          id="longitude"
          placeholder="Longitude"
          step="0.0001"
          min="-180"
          max="180"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
        />
        
        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>
    </div>
  );
};

export default LocationInput;
