/**
 * Light Pollution Service
 * 
 * This service provides functions for determining light pollution levels
 * at a given location. For this demo, we use a simplified model based on
 * population density and distance from major cities.
 * 
 * In a production app, this would connect to actual light pollution databases
 * like the World Atlas of Artificial Night Sky Brightness.
 */

// Major cities with approximate coordinates and population size factor
const MAJOR_CITIES = [
  { name: "New York", lat: 40.7128, lng: -74.0060, factor: 10 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, factor: 9 },
  { name: "Chicago", lat: 41.8781, lng: -87.6298, factor: 8 },
  { name: "London", lat: 51.5074, lng: -0.1278, factor: 9 },
  { name: "Paris", lat: 48.8566, lng: 2.3522, factor: 8 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, factor: 10 },
  { name: "Shanghai", lat: 31.2304, lng: 121.4737, factor: 10 },
  { name: "Sao Paulo", lat: 23.5558, lng: -46.6396, factor: 9 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, factor: 9 },
  { name: "Beijing", lat: 39.9042, lng: 116.4074, factor: 9 },
  { name: "Moscow", lat: 55.7558, lng: 37.6173, factor: 8 },
  { name: "Sydney", lat: 33.8688, lng: 151.2093, factor: 7 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050, factor: 7 },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332, factor: 8 },
  { name: "Cairo", lat: 30.0444, lng: 31.2357, factor: 8 },
  { name: "Delhi", lat: 28.7041, lng: 77.1025, factor: 9 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832, factor: 7 },
  { name: "Rome", lat: 41.9028, lng: 12.4964, factor: 6 },
  { name: "Seoul", lat: 37.5665, lng: 126.9780, factor: 9 },
  { name: "Bangkok", lat: 13.7563, lng: 100.5018, factor: 8 }
];

/**
 * Calculate the distance between two points using the Haversine formula
 * @param {number} lat1 - First point latitude
 * @param {number} lng1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lng2 - Second point longitude
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Calculate light pollution level at a location based on proximity to major cities
 * @param {number} latitude - Location latitude 
 * @param {number} longitude - Location longitude
 * @returns {Object} Light pollution data
 */
export const calculateLightPollution = (latitude, longitude) => {
  // Calculate distances to all major cities
  const cityDistances = MAJOR_CITIES.map(city => {
    const distance = calculateDistance(latitude, longitude, city.lat, city.lng);
    return {
      name: city.name,
      distance,
      factor: city.factor
    };
  });
  
  // Sort by distance
  cityDistances.sort((a, b) => a.distance - b.distance);
  
  // Calculate light pollution based on distance and population
  // Light pollution decreases with the square of the distance
  let lightPollution = 0;
  let closestCity = null;
  
  cityDistances.forEach(city => {
    // Only consider cities within 300km
    if (city.distance < 300) {
      const cityEffect = city.factor * 100 / (city.distance * city.distance + 1);
      lightPollution += cityEffect;
      
      if (!closestCity || city.distance < closestCity.distance) {
        closestCity = {
          name: city.name,
          distance: city.distance
        };
      }
    }
  });
  
  // Cap the maximum value at 100
  lightPollution = Math.min(100, lightPollution);
  
  // Determine the pollution level category
  let pollutionLevel;
  let description;
  
  if (lightPollution < 10) {
    pollutionLevel = "Excellent";
    description = "Dark sky site, perfect for aurora viewing. Milky Way clearly visible.";
  } else if (lightPollution < 30) {
    pollutionLevel = "Good";
    description = "Low light pollution. Aurora should be clearly visible when active.";
  } else if (lightPollution < 60) {
    pollutionLevel = "Moderate";
    description = "Moderate light pollution. Aurora visible during strong activity.";
  } else if (lightPollution < 80) {
    pollutionLevel = "High";
    description = "High light pollution. Aurora may be faint or difficult to see.";
  } else {
    pollutionLevel = "Severe";
    description = "Severe light pollution. Aurora unlikely to be visible.";
  }
  
  // Add tips if there's high light pollution
  let tips = "";
  if (lightPollution >= 60) {
    // Calculate direction to darker areas
    const directions = [];
    
    for (let bearing = 0; bearing < 360; bearing += 45) {
      // Calculate a point 50km in this direction
      const bearing_rad = bearing * Math.PI / 180;
      const lat_rad = latitude * Math.PI / 180;
      const lng_rad = longitude * Math.PI / 180;
      const dist_km = 50;
      
      const new_lat_rad = Math.asin(
        Math.sin(lat_rad) * Math.cos(dist_km / 6371) +
        Math.cos(lat_rad) * Math.sin(dist_km / 6371) * Math.cos(bearing_rad)
      );
      
      const new_lng_rad = lng_rad + Math.atan2(
        Math.sin(bearing_rad) * Math.sin(dist_km / 6371) * Math.cos(lat_rad),
        Math.cos(dist_km / 6371) - Math.sin(lat_rad) * Math.sin(new_lat_rad)
      );
      
      const new_lat = new_lat_rad * 180 / Math.PI;
      const new_lng = new_lng_rad * 180 / Math.PI;
      
      const direction_pollution = calculateLightPollutionValue(new_lat, new_lng);
      
      if (direction_pollution < lightPollution - 20) {
        const direction_name = getBearingName(bearing);
        directions.push(direction_name);
      }
    }
    
    if (directions.length > 0) {
      tips = `Consider traveling ${directions.join(" or ")} for better aurora visibility.`;
    } else {
      tips = "Consider traveling at least 50km away from urban areas for better aurora visibility.";
    }
  }
  
  return {
    value: Math.round(lightPollution),
    level: pollutionLevel,
    description,
    tips,
    closestCity
  };
};

/**
 * Get the light pollution value without the full data
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {number} Light pollution value (0-100)
 */
const calculateLightPollutionValue = (latitude, longitude) => {
  let lightPollution = 0;
  
  MAJOR_CITIES.forEach(city => {
    const distance = calculateDistance(latitude, longitude, city.lat, city.lng);
    if (distance < 300) {
      const cityEffect = city.factor * 100 / (distance * distance + 1);
      lightPollution += cityEffect;
    }
  });
  
  return Math.min(100, lightPollution);
};

/**
 * Convert a bearing in degrees to a cardinal direction
 * @param {number} bearing 
 * @returns {string} Cardinal direction
 */
const getBearingName = (bearing) => {
  const directions = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"];
  return directions[Math.round(bearing / 45) % 8];
};
