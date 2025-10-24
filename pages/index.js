import { useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  useEffect(() => {
    // Check if window is defined (client-side only)
    if (typeof window === 'undefined') return;

    // Function to load Google Maps API
    const loadGoogleMaps = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // Create the script element
      const script = document.createElement('script');
      // Use the environment variable directly - Next.js will replace this at build time
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
      
      if (!apiKey) {
        console.error('Google Maps API key is not set');
        return;
      }
      
      // Load Google Maps API with required libraries and features
      let scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&loading=async&callback=initMap`;
      
      // Add Map ID if available
      if (mapId) {
        scriptUrl += `&map_ids=${mapId}`;
      } else {
        console.warn('Google Maps Map ID is not set. Advanced Markers may not work correctly.');
      }
      
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      
      // Handle script load
      script.onload = () => {
        console.log('Google Maps API loaded successfully');
      };
      
      // Handle script error
      script.onerror = () => {
        console.error('Error loading Google Maps API');
      };
      
      // Add script to the document
      document.head.appendChild(script);

      return () => {
        // Cleanup
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };

    // Load Google Maps
    loadGoogleMaps();
  }, []);

  // The initMap function will be available globally
  if (typeof window !== 'undefined') {
    window.initMap = function() {
      // Initialize the map with initial center and Map ID
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: { lat: 37.0, lng: -109.0 },
        mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID, // Add your Map ID from Google Cloud Console
        mapTypeControl: false,
      });

      // Define the points (lat, lng, name)
      const points = [
        { lat: 37.7668, lng: -113.16578, name: "Enoch Dirt" },
        { lat: 39.15912, lng: -108.73447, name: "Fruita" },
        { lat: 33.53536, lng: -112.05958, name: "Phoenix" },
        { lat: 37.91118, lng: -109.48635, name: "Monticello" },
        { lat: 36.36305, lng: -105.30173, name: "Angel Fire" }
      ];

      // Add markers using AdvancedMarkerElement
      const markers = [];
      points.forEach(point => {
        // Create a div element for the marker
        const markerElement = document.createElement('div');
        markerElement.className = 'advanced-marker';
        markerElement.textContent = '📍'; // You can customize this with your own marker
        markerElement.style.fontSize = '24px';
        markerElement.style.cursor = 'pointer';

        // Create the advanced marker
        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: point.lat, lng: point.lng },
          map: map,
          title: point.name,
          content: markerElement
        });

        // Add info window on click
        const infoWindow = new google.maps.InfoWindow({
          content: `<strong>${point.name}</strong><br>Lat: ${point.lat}, Lng: ${point.lng}`
        });

        markerElement.addEventListener('click', () => {
          infoWindow.open({
            anchor: marker,
            map,
            shouldFocus: false,
          });
        });

        markers.push(marker);
      });

      // Create red polylines for ALL pairs of points
      if (window.google?.maps?.Polyline) {
        for (let i = 0; i < points.length; i++) {
          for (let j = i + 1; j < points.length; j++) {
            try {
              const path = [
                { lat: points[i].lat, lng: points[i].lng },
                { lat: points[j].lat, lng: points[j].lng }
              ];
              const polyline = new google.maps.Polyline({
                path: path,
                geodesic: false,
                strokeColor: "#FF0000",
                strokeOpacity: 0.7,
                strokeWeight: 2
              });
              polyline.setMap(map);
            } catch (error) {
              console.error('Error creating polyline:', error);
            }
          }
        }
      } else {
        console.warn('Google Maps Polyline API not available');
      }

      // Phoenix position
      const phoenix = { lat: 33.53536, lng: -112.05958 };

      // Initial endpoints (approximate 2000-mile extensions, adjustable)
      const endEnoch = { lat: 62.087509, lng: -119.523797 };
      const endFruita = { lat: 60.549120, lng: -96.087397 };
      const endAngel = { lat: 47.662681, lng: -78.296927 };

      // Draggable endpoint markers and polylines
      const endpoints = [
        { pos: endEnoch, label: "End Enoch", through: points[0] },
        { pos: endFruita, label: "End Fruita", through: points[1] },
        { pos: endAngel, label: "End Angel", through: points[4] }
      ];

      const bluePolylines = [];
      
      if (window.google?.maps?.Polyline && window.google?.maps?.marker?.AdvancedMarkerElement) {
        endpoints.forEach(endpoint => {
          try {
            // Create marker element
            const markerElement = document.createElement('div');
            markerElement.className = 'advanced-marker';
            markerElement.textContent = '📍';
            markerElement.style.fontSize = '24px';
            markerElement.style.cursor = 'move';

            // Create advanced marker
            const marker = new google.maps.marker.AdvancedMarkerElement({
              position: endpoint.pos,
              map: map,
              title: endpoint.label,
              content: markerElement,
              gmpDraggable: true
            });

            // Create polyline
            const polyline = new google.maps.Polyline({
              path: [phoenix, endpoint.through, endpoint.pos],
              geodesic: false,
              strokeColor: "#0000FF",
              strokeOpacity: 0.7,
              strokeWeight: 2
            });
            polyline.setMap(map);
            
            bluePolylines.push({ polyline, marker });

            // Update polyline when marker is dragged
            marker.addListener('drag', (e) => {
              polyline.setPath([phoenix, endpoint.through, e.latLng]);
              
              // Update info window content
              const lat = e.latLng.lat().toFixed(6);
              const lng = e.latLng.lng().toFixed(6);
              infoWindow.setContent(`<strong>${endpoint.label}</strong><br>Lat: ${lat}, Lng: ${lng}`);
            });

            // Add info window
            const infoWindow = new google.maps.InfoWindow({
              content: `<strong>${endpoint.label}</strong><br>Lat: ${endpoint.pos.lat.toFixed(6)}, Lng: ${endpoint.pos.lng.toFixed(6)}`
            });

            markerElement.addEventListener('click', () => {
              infoWindow.open({
                anchor: marker,
                map,
                shouldFocus: false,
              });
            });
          } catch (error) {
            console.error('Error creating endpoint marker:', error);
          }
        });
      } else {
        console.warn('Google Maps AdvancedMarkerElement or Polyline API not available');
      }

      // Fit bounds to include all points and endpoints
      const bounds = new google.maps.LatLngBounds();
      points.forEach(point => bounds.extend({ lat: point.lat, lng: point.lng }));
      endpoints.forEach(endpoint => bounds.extend(endpoint.pos));
      map.fitBounds(bounds);
    };
  }

  return (
    <div>
      <Head>
        <title>Custom Map: All-Pairs Red Lines + Adjustable Blue Extensions</title>
        <meta name="description" content="Interactive map with custom markers and lines" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style jsx global>{`
          #map {
            height: 600px;
            width: 100%;
          }
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
        `}</style>
      </Head>

      <main>
        <h1>Southwest US All-Pairs Map with Adjustable Extensions</h1>
        <p>Markers for: Enoch Dirt, Fruita, Phoenix, Monticello, Angel Fire. Red straight lines connect every point to every other. Blue straight lines extend from Phoenix through Enoch Dirt, Fruita, and Angel Fire with draggable endpoints for manual adjustment.</p>
        <div id="map"></div>
      </main>
    </div>
  );
}
