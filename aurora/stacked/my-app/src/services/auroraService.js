// API endpoints
const NOAA_KP_INDEX_API = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
const AURORA_FORECAST_API = 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json';

/**
 * Fetches the current Kp index from NOAA
 * @returns {Promise<number>} - The current Kp index
 */
export const fetchCurrentKpIndex = async () => {
  try {
    const response = await fetch(NOAA_KP_INDEX_API);
    if (!response.ok) throw new Error('Failed to fetch Kp index data');
    
    const kpData = await response.json();
    
    // Get the most recent Kp value (last item in the array)
    return parseFloat(kpData[kpData.length - 1][1]);
  } catch (error) {
    console.error('Error fetching Kp index:', error);
    throw error;
  }
};

/**
 * Fetches aurora forecast data from NOAA
 * @returns {Promise<Object>} - Aurora forecast data
 */
export const fetchAuroraForecast = async () => {
  try {
    const response = await fetch(AURORA_FORECAST_API);
    if (!response.ok) throw new Error('Failed to fetch aurora forecast data');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching aurora forecast:', error);
    throw error;
  }
};

/**
 * Calculate visibility chance based on Kp index and latitude
 * This is a simplified model - real aurora visibility depends on many factors
 * @param {number} kpIndex - Current Kp index
 * @param {number} latitude - User's latitude
 * @returns {number} - Percentage chance of visibility
 */
export const calculateVisibilityChance = (kpIndex, latitude) => {
  // Convert latitude to geomagnetic latitude (simplified approximation)
  // Real implementation would use a more complex geomagnetic model
  const absoluteLatitude = Math.abs(latitude);
  
  // Aurora oval typically starts at higher latitudes
  // As Kp increases, the oval expands towards lower latitudes
  const baseLatitude = 67 - (kpIndex * 3);
  
  if (absoluteLatitude >= baseLatitude + 5) {
    // High latitude - good chance with sufficient Kp
    return Math.min(95, 60 + (kpIndex * 5));
  } else if (absoluteLatitude >= baseLatitude) {
    // Near the typical aurora oval
    const factor = (absoluteLatitude - baseLatitude) / 5;
    return Math.min(90, 20 + (kpIndex * 8) + (factor * 30));
  } else if (absoluteLatitude >= baseLatitude - 5) {
    // Just below typical oval - needs higher Kp
    return Math.max(5, (kpIndex - 3) * 15);
  } else {
    // Low latitude - very low chance unless extreme geomagnetic storm
    return Math.max(0, (kpIndex - 6) * 10);
  }
};
