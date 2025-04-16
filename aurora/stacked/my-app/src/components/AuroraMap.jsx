import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const AuroraMap = ({ coordinates, kpIndex }) => {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [worldData, setWorldData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const dragStartPos = useRef(null);
  
  // Constants for zooming
  const MIN_ZOOM = 0.7;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.1;
  
  // Fetch world data when component mounts
  useEffect(() => {
    setIsLoading(true);
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load world map data');
        }
        return response.json();
      })
      .then(data => {
        setWorldData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading world map data:', error);
        setIsLoading(false);
      });
  }, []);
  
  // Initialize map dimensions when component mounts
  useEffect(() => {
    if (wrapperRef.current) {
      const { width } = wrapperRef.current.getBoundingClientRect();
      setDimensions({
        width,
        height: Math.min(500, window.innerHeight * 0.6)
      });
    }
    
    const handleResize = () => {
      if (wrapperRef.current) {
        const { width } = wrapperRef.current.getBoundingClientRect();
        setDimensions({
          width,
          height: Math.min(500, window.innerHeight * 0.6)
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Draw map and aurora oval when component updates
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || kpIndex === null || !worldData) return;
    
    drawMap();
  }, [dimensions, kpIndex, coordinates, rotation, worldData, zoomLevel]);

  // Prevent page scroll when mouse is over the SVG (globe)
  useEffect(() => {
    const svgElem = svgRef.current;
    if (!svgElem) return;
    const preventScroll = (e) => e.preventDefault();
    svgElem.addEventListener('wheel', preventScroll, { passive: false });
    return () => svgElem.removeEventListener('wheel', preventScroll);
  }, [svgRef, isLoading]);
  
  // Handle mouse events for globe rotation
  const handleMouseDown = (event) => {
    if (!svgRef.current) return;
    
    // Save the starting position for the drag
    dragStartPos.current = {
      x: event.clientX,
      y: event.clientY,
      rotation: { ...rotation }
    };
    
    setDragging(true);
    
    // Prevent default browser behavior
    event.preventDefault();
  };
  
  const handleMouseMove = (event) => {
    if (!dragging || !dragStartPos.current) return;
    
    // Calculate the movement distance
    const dx = event.clientX - dragStartPos.current.x;
    const dy = event.clientY - dragStartPos.current.y;
    
    // Update rotation (dx moves the longitude, dy moves the latitude)
    // Fix left/right swap by changing the sign of dx calculation
    setRotation({
      x: (dragStartPos.current.rotation.x + dx / 3) % 360, // Note the + sign here for correct direction
      y: Math.max(-90, Math.min(90, dragStartPos.current.rotation.y + dy / 3))
    });
    
    // Prevent default browser behavior
    event.preventDefault();
  };
  
  const handleMouseUp = () => {
    setDragging(false);
    dragStartPos.current = null;
  };
  
  // Handle mouse wheel for zooming
  const handleWheel = (event) => {
    event.preventDefault();
    
    // Determine zoom direction (up or down)
    const zoomDirection = event.deltaY < 0 ? 1 : -1;
    
    // Calculate new zoom level
    const newZoomLevel = Math.max(
      MIN_ZOOM, 
      Math.min(MAX_ZOOM, zoomLevel + (zoomDirection * ZOOM_STEP))
    );
    
    setZoomLevel(newZoomLevel);
  };
  
  // Center the globe on user coordinates when they change
  useEffect(() => {
    if (coordinates) {
      setRotation({
        x: -coordinates.longitude,
        y: coordinates.latitude
      });
    }
  }, [coordinates]);
  
  // Main function to draw the map
  const drawMap = () => {
    const { width, height } = dimensions;
    
    // Calculate base scale based on container size
    const baseScale = Math.min(width, height) * 0.4;
    
    // Apply zoom level to the scale
    const scaledSize = baseScale * zoomLevel;
    
    // Clear previous SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Map projection
    const projection = geoOrthographic()
      .scale(scaledSize)
      .translate([width / 2, height / 2])
      .rotate([rotation.x, -rotation.y])
      .clipAngle(90);
    
    // Path generator
    const pathGenerator = geoPath().projection(projection);
    
    // Create globe background
    svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', projection.scale())
      .attr('fill', '#0D2655')
      .attr('stroke', '#777')
      .attr('stroke-width', 0.5);
    
    // Create country features from TopoJSON
    const countries = feature(worldData, worldData.objects.countries);
    
    // Draw countries
    svg.selectAll('.country')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator)
      .attr('fill', '#183B69')
      .attr('stroke', '#fff') // Changed to white for better contrast
      .attr('stroke-width', 0.3); // Increased stroke width
    
    // Draw graticules (latitude/longitude grid)
    const graticule = d3.geoGraticule();
    svg.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 0.2)
      .attr('stroke-dasharray', '2,2');
    
    // Calculate aurora oval based on Kp index
    // As Kp increases, the oval expands towards lower latitudes
    const baseLatitude = 67 - (kpIndex * 3);
    
    // Draw northern aurora oval
    drawAuroraOval(svg, projection, pathGenerator, baseLatitude, getKpColor(kpIndex));
    
    // Draw southern aurora oval
    drawAuroraOval(svg, projection, pathGenerator, -baseLatitude, getKpColor(kpIndex));
    
    // Draw user location if available
    if (coordinates) {
      const [x, y] = projection([coordinates.longitude, coordinates.latitude]);
      
      // Only draw if point is visible on the globe
      if (x && y) {
        // Location marker
        svg.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 5)
          .attr('fill', '#ff4081')
          .attr('stroke', '#fff')
          .attr('stroke-width', 1);
        
        // Pulsing effect
        svg.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 8)
          .attr('fill', 'none')
          .attr('stroke', '#ff4081')
          .attr('stroke-width', 2)
          .attr('opacity', 0.7)
          .call(circle => {
            circle.append('animate')
              .attr('attributeName', 'r')
              .attr('values', '8;14')
              .attr('dur', '1.5s')
              .attr('repeatCount', 'indefinite');
            
            circle.append('animate')
              .attr('attributeName', 'opacity')
              .attr('values', '0.7;0')
              .attr('dur', '1.5s')
              .attr('repeatCount', 'indefinite');
          });
      }
    }
  };
  
  // Draw aurora oval
  const drawAuroraOval = (svg, projection, pathGenerator, baseLatitude, color) => {
    // Generate points for the aurora oval
    const ovalPoints = [];
    for (let lng = -180; lng <= 180; lng += 5) {
      // Add variation to make it look more realistic
      const variation = Math.sin(lng * Math.PI / 180) * 4;
      const lat = baseLatitude + variation;
      ovalPoints.push([lng, lat]);
    }
    
    // Close the loop
    ovalPoints.push(ovalPoints[0]);
    
    // Create a GeoJSON line from the points
    const ovalLine = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: ovalPoints
      }
    };
    
    // Draw the aurora oval
    svg.append('path')
      .datum(ovalLine)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-dasharray', '3,2');
    
    // Create a filled area with lower opacity
    // Generate wider area for the fill
    const ovalFillPoints = [];
    const innerPoints = [];
    
    for (let lng = -180; lng <= 180; lng += 5) {
      const variation = Math.sin(lng * Math.PI / 180) * 4;
      
      // Outer edge (further from pole)
      const outerLat = baseLatitude + variation + 4;
      ovalFillPoints.push([lng, outerLat]);
      
      // Store inner points for later
      innerPoints.unshift([lng, baseLatitude + variation - 2]);
    }
    
    // Add inner edge to close the polygon (closer to pole)
    // We go in reverse order to create a closed shape
    ovalFillPoints.push(...innerPoints);
    
    // Close the loop
    ovalFillPoints.push(ovalFillPoints[0]);
    
    // Create a GeoJSON polygon from the points
    const ovalFill = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [ovalFillPoints]
      }
    };
    
    // Draw the aurora fill
    svg.append('path')
      .datum(ovalFill)
      .attr('d', pathGenerator)
      .attr('fill', color)
      .attr('fill-opacity', 0.3)
      .attr('stroke', 'none');
    
    // Add glow effect
    svg.append('path')
      .datum(ovalFill)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 8)
      .attr('stroke-opacity', 0.1)
      .attr('filter', 'blur(8px)');
  };
  
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
  
  return (
    <div className="aurora-map-container">
      <h2>Aurora Oval Map</h2>
      <div className="map-wrapper" ref={wrapperRef}>
        {isLoading ? (
          <div className="loading-map">
            <div className="spinner"></div>
            <p>Loading 3D globe...</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{ borderRadius: '8px', cursor: dragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
        )}
      </div>
      <div className="map-controls">
        <span className="drag-hint">Click and drag to rotate the globe • Use mouse wheel to zoom</span>
        {coordinates && (
          <div className="coordinates-display">
            Your Location: {coordinates.latitude.toFixed(2)}° {coordinates.latitude >= 0 ? 'N' : 'S'}, {coordinates.longitude.toFixed(2)}° {coordinates.longitude >= 0 ? 'E' : 'W'}
          </div>
        )}
        <div className="zoom-controls">
          <button 
            className="zoom-button" 
            onClick={() => setZoomLevel(Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP))}
            disabled={zoomLevel <= MIN_ZOOM}
          >
            −
          </button>
          <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
          <button 
            className="zoom-button" 
            onClick={() => setZoomLevel(Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP))}
            disabled={zoomLevel >= MAX_ZOOM}
          >
            +
          </button>
        </div>
      </div>
      <p className="map-disclaimer">
        This 3D globe shows the approximate oval where aurora may be visible based on the current Kp-index.
        Drag to rotate the view and see auroras on both north and south poles.
      </p>
    </div>
  );
};

export default AuroraMap;
