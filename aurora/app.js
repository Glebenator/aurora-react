// DOM Elements
const getLocationBtn = document.getElementById('get-location');
const submitCoordinatesBtn = document.getElementById('submit-coordinates');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const locationStatus = document.getElementById('location-status');
const loading = document.getElementById('loading');
const auroraData = document.getElementById('aurora-data');
const errorMessage = document.getElementById('error-message');
const latDisplay = document.getElementById('lat-display');
const lngDisplay = document.getElementById('lng-display');
const kpValue = document.getElementById('kp-value');
const visibilityScore = document.getElementById('visibility-score');
const visibilityMessage = document.getElementById('visibility-message');
const forecastChart = document.getElementById('forecast-chart');

// API endpoints
const NOAA_KP_INDEX_API = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
const AURORA_FORECAST_API = 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json';

// Event Listeners
getLocationBtn.addEventListener('click', getUserLocation);
submitCoordinatesBtn.addEventListener('click', useManualCoordinates);

// Get user's location using Geolocation API
function getUserLocation() {
    if (navigator.geolocation) {
        locationStatus.innerHTML = '<p>Accessing your location...</p>';
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                // Update UI with coordinates
                latitudeInput.value = latitude;
                longitudeInput.value = longitude;
                
                locationStatus.innerHTML = '<p>Location acquired successfully!</p>';
                
                // Fetch aurora data with these coordinates
                fetchAuroraData(latitude, longitude);
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
        locationStatus.innerHTML = '<p>Geolocation is not supported by your browser. Please enter coordinates manually.</p>';
    }
}

// Use manually entered coordinates
function useManualCoordinates() {
    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);
    
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
        locationStatus.innerHTML = '<p>Please enter valid coordinates. Latitude: -90 to 90, Longitude: -180 to 180</p>';
        return;
    }
    
    locationStatus.innerHTML = '<p>Using provided coordinates</p>';
    fetchAuroraData(latitude, longitude);
}

// Handle geolocation errors
function handleLocationError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            locationStatus.innerHTML = '<p>Location access was denied. Please enter coordinates manually or grant permission.</p>';
            break;
        case error.POSITION_UNAVAILABLE:
            locationStatus.innerHTML = '<p>Location information is unavailable. Please enter coordinates manually.</p>';
            break;
        case error.TIMEOUT:
            locationStatus.innerHTML = '<p>Location request timed out. Please enter coordinates manually.</p>';
            break;
        case error.UNKNOWN_ERROR:
            locationStatus.innerHTML = '<p>An unknown error occurred. Please enter coordinates manually.</p>';
            break;
    }
}

// Fetch aurora data using the coordinates
async function fetchAuroraData(latitude, longitude) {
    try {
        // Show loading state
        loading.classList.remove('hidden');
        auroraData.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // Update displayed coordinates
        latDisplay.textContent = latitude.toFixed(4);
        lngDisplay.textContent = longitude.toFixed(4);
        
        // Fetch current Kp index from NOAA
        const kpResponse = await fetch(NOAA_KP_INDEX_API);
        if (!kpResponse.ok) throw new Error('Failed to fetch Kp index data');
        const kpData = await kpResponse.json();
        
        // Get the most recent Kp value (last item in the array)
        const currentKp = parseFloat(kpData[kpData.length - 1][1]);
        
        // Fetch aurora forecast data
        const auroraResponse = await fetch(AURORA_FORECAST_API);
        if (!auroraResponse.ok) throw new Error('Failed to fetch aurora forecast data');
        const auroraForecastData = await auroraResponse.json();
        
        // Calculate visibility chance based on Kp index and location
        const visibilityChance = calculateVisibilityChance(currentKp, latitude);
        
        // Update UI with results
        updateUI(currentKp, visibilityChance);
        
        // Create forecast chart (simplified version for this example)
        createForecastChart(currentKp);
        
        // Hide loading and show results
        loading.classList.add('hidden');
        auroraData.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error fetching aurora data:', error);
        loading.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        errorMessage.querySelector('p').textContent = `Unable to fetch aurora data: ${error.message}`;
    }
}

// Calculate visibility chance based on Kp index and latitude
// This is a simplified model - real aurora visibility depends on many factors
function calculateVisibilityChance(kpIndex, latitude) {
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
}

// Update UI with aurora data
function updateUI(kpIndex, visibilityChance) {
    // Update Kp value
    kpValue.textContent = kpIndex.toFixed(1);
    
    // Set color based on Kp index
    if (kpIndex >= 7) {
        kpValue.style.color = '#f44336'; // Red - severe storm
    } else if (kpIndex >= 5) {
        kpValue.style.color = '#ff9800'; // Orange - strong storm
    } else if (kpIndex >= 3) {
        kpValue.style.color = '#4caf50'; // Green - moderate activity
    } else {
        kpValue.style.color = '#4fc3f7'; // Blue - low activity
    }
    
    // Update visibility chance
    visibilityScore.textContent = `${Math.round(visibilityChance)}%`;
    
    // Set visibility message
    if (visibilityChance >= 70) {
        visibilityMessage.textContent = "High chance of seeing aurora! Get to a dark location away from city lights.";
        visibilityScore.style.color = '#4caf50'; // Green
    } else if (visibilityChance >= 30) {
        visibilityMessage.textContent = "Moderate chance of aurora. Worth looking if skies are clear and you're away from light pollution.";
        visibilityScore.style.color = '#ff9800'; // Orange
    } else {
        visibilityMessage.textContent = "Low chance of seeing aurora at your location. Consider traveling to higher latitudes for better visibility.";
        visibilityScore.style.color = '#f44336'; // Red
    }
}

// Create a simple forecast chart 
// In a real implementation, this would use a proper charting library like Chart.js
function createForecastChart(currentKp) {
    // For this example, we'll create a simple visualization
    // A real implementation would use actual forecast data
    
    // Clear previous chart
    forecastChart.innerHTML = '';
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.style.display = 'flex';
    chartContainer.style.alignItems = 'flex-end';
    chartContainer.style.height = '100%';
    chartContainer.style.justifyContent = 'space-between';
    chartContainer.style.padding = '0 10px';
    
    // Generate 24 hours of "forecast" data based on the current Kp value
    // This is just for demonstration - a real forecast would use actual prediction data
    const hours = 24;
    const variation = 1.5; // Maximum random variation
    
    for (let i = 0; i < hours; i++) {
        // Generate a somewhat realistic variation based on current Kp
        // In reality, we would use actual forecast data from NOAA or similar sources
        let randomFactor = (Math.random() * 2 - 1) * variation;
        let predictedKp = Math.max(0, Math.min(9, currentKp + randomFactor));
        
        // Create bar for this hour
        const bar = document.createElement('div');
        bar.style.width = `${100 / hours}%`;
        bar.style.backgroundColor = getKpColor(predictedKp);
        bar.style.height = `${(predictedKp / 9) * 100}%`;
        bar.style.minHeight = '5px';
        bar.style.margin = '0 1px';
        bar.style.position = 'relative';
        
        // Hour label
        const hourLabel = document.createElement('div');
        hourLabel.textContent = `${i}h`;
        hourLabel.style.position = 'absolute';
        hourLabel.style.bottom = '-20px';
        hourLabel.style.left = '50%';
        hourLabel.style.transform = 'translateX(-50%)';
        hourLabel.style.fontSize = '10px';
        
        // Kp value label
        const kpLabel = document.createElement('div');
        kpLabel.textContent = predictedKp.toFixed(1);
        kpLabel.style.position = 'absolute';
        kpLabel.style.top = '-20px';
        kpLabel.style.left = '50%';
        kpLabel.style.transform = 'translateX(-50%)';
        kpLabel.style.fontSize = '10px';
        
        bar.appendChild(hourLabel);
        bar.appendChild(kpLabel);
        chartContainer.appendChild(bar);
    }
    
    forecastChart.appendChild(chartContainer);
}

// Get color based on Kp index for the chart
function getKpColor(kpIndex) {
    if (kpIndex >= 7) {
        return '#f44336'; // Red - severe storm
    } else if (kpIndex >= 5) {
        return '#ff9800'; // Orange - strong storm
    } else if (kpIndex >= 3) {
        return '#4caf50'; // Green - moderate activity
    } else {
        return '#4fc3f7'; // Blue - low activity
    }
}

// Add a simple aurora animation effect to the background
function createAuroraBackground() {
    const container = document.querySelector('.container');
    const aurora = document.createElement('div');
    aurora.classList.add('aurora-background');
    container.appendChild(aurora);
}

// Initialize the app
function init() {
    // Check if there are already coordinates in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    
    if (lat && lng) {
        latitudeInput.value = lat;
        longitudeInput.value = lng;
        useManualCoordinates();
    }
}

// Initialize the app when the page loads
window.addEventListener('load', init);