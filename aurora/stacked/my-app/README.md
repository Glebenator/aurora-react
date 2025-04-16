# Aurora Forecast React Application

This is a React-based web application that shows the current aurora (Northern/Southern Lights) activity level based on the user's location. It provides an intuitive interface to check whether you might be able to see the aurora from your current position.

## Features

- Automatic geolocation (with user permission)
- Manual coordinate entry option
- Current Kp-index display (measure of geomagnetic activity)
- Visibility chance calculation based on location and current conditions
- 24-hour forecast visualization using Chart.js
- Interactive 3D globe showing the aurora oval
- Light pollution analysis to find optimal viewing locations

## Tech Stack

- React 19 with Hooks
- Vite for fast development and building
- Chart.js for data visualization
- D3.js and TopoJSON for interactive 3D globe
- Fetch API for data retrieval
- Modern CSS with variables and flexbox

## How It Works

1. The application gets the user's location either through browser geolocation or manual entry
2. It fetches real-time data from NOAA Space Weather Prediction Center APIs
3. The app calculates the likelihood of seeing aurora based on the user's geomagnetic latitude and current Kp-index
4. Results are displayed with a simple, intuitive interface with visual indicators

## Project Structure

- `src/components/` - React components
  - `LocationInput.jsx` - Gets user location
  - `KpIndex.jsx` - Displays current Kp-index
  - `VisibilityScore.jsx` - Shows aurora visibility chance
  - `ForecastChart.jsx` - Visualizes 24-hour forecast
  - `AuroraMap.jsx` - Displays interactive 3D globe with aurora oval
  - `LightPollution.jsx` - Analyzes light pollution for aurora viewing
- `src/services/` - API and data services
  - `auroraService.js` - NOAA API integration
  - `lightPollutionService.js` - Light pollution calculation
- `src/assets/` - Static assets
- `src/App.jsx` - Main application component
- `src/App.css` - Application styles

## Data Sources

- Kp-index data: NOAA Planetary K-index API
- Aurora oval data: NOAA OVATION Aurora Forecast

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Run development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Future Improvements

- Integration with real-time cloud cover data
- Weather forecast integration
- User accounts for saving favorite locations
- Mobile app using React Native
- Historical data and trend analysis
- User-submitted aurora sighting reports

## License

This project is open source and available for educational purposes.
