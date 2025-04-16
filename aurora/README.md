# Aurora Forecast Web Application

This web application shows the current aurora (Northern/Southern Lights) activity level based on the user's location. It provides a simple interface to check whether you might be able to see the aurora from your current position.

## Features

- Automatic geolocation (with user permission)
- Manual coordinate entry option
- Current Kp-index display (measure of geomagnetic activity)
- Visibility chance calculation based on location and current conditions
- 24-hour forecast visualization
- Responsive design that works on desktop and mobile devices

## How It Works

1. The application gets the user's location either through browser geolocation or manual entry
2. It fetches real-time data from NOAA Space Weather Prediction Center APIs
3. The app calculates the likelihood of seeing aurora based on the user's geomagnetic latitude and current Kp-index
4. Results are displayed with a simple, intuitive interface

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript (no frameworks)
- Uses the browser's Geolocation API
- Fetches data from NOAA SWPC public APIs
- Responsive design works on all screen sizes

## Data Sources

- Kp-index data: NOAA Planetary K-index API
- Aurora oval data: NOAA OVATION Aurora Forecast

## Limitations

- This is a demonstration project and should not be used for scientific or navigation purposes
- Aurora visibility depends on many factors beyond what this app can calculate (cloud cover, light pollution, solar elevation, etc.)
- The visibility calculation is a simplified model and actual visibility may vary

## Future Improvements

- Integration with real-time cloud cover data
- More accurate geomagnetic latitude calculation
- Historical data and trend analysis
- User-submitted aurora sighting reports
- Light pollution overlay to find optimal viewing locations

## Usage

Simply open `index.html` in a web browser and allow location access when prompted, or enter your coordinates manually.

## License

This project is open source and available for educational purposes.