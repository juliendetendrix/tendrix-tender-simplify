import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const ParisMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // For now using a placeholder token - users should add their own
    mapboxgl.accessToken = 'pk.eyJ1IjoidGVuZHJpeCIsImEiOiJjbHZ4eXN5eHMwMDBqMmtwZDRmZm45aWprIn0.placeholder';
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [2.3522, 48.8566], // Paris coordinates
        zoom: 11,
        pitch: 30,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        if (!map.current) return;

        // Company location (center of Paris - 13th arrondissement)
        const companyMarker = new mapboxgl.Marker({ 
          color: '#3B82F6', // Blue color for company
          scale: 1.2 
        })
          .setLngLat([2.3597, 48.8323])
          .setPopup(new mapboxgl.Popup().setHTML('<div><strong>Your Company</strong><br/>13th Arrondissement, Paris</div>'))
          .addTo(map.current);

        // Tender opportunities around Paris
        const tenderLocations = [
          { lng: 2.3488, lat: 48.8534, title: 'Energy Renovation Project', budget: '€180,000 - €320,000' },
          { lng: 2.3683, lat: 48.8606, title: 'IT Services & Cybersecurity', budget: '€95,000 - €150,000' },
          { lng: 2.3522, lat: 48.8566, title: 'Urban Green Spaces', budget: '€60,000 - €110,000' },
          { lng: 2.3444, lat: 48.8584, title: 'Public Building Renovation', budget: '€120,000 - €200,000' },
          { lng: 2.3656, lat: 48.8478, title: 'Digital Infrastructure', budget: '€85,000 - €140,000' },
          { lng: 2.3389, lat: 48.8611, title: 'Sustainable Transport', budget: '€150,000 - €250,000' },
        ];

        // Add tender opportunity markers
        tenderLocations.forEach((tender, index) => {
          const marker = new mapboxgl.Marker({ 
            color: '#10B981', // Green color for tenders
            scale: 0.8 
          })
            .setLngLat([tender.lng, tender.lat])
            .setPopup(new mapboxgl.Popup().setHTML(
              `<div><strong>${tender.title}</strong><br/>Budget: ${tender.budget}</div>`
            ))
            .addTo(map.current!);

          // Add subtle animation delay
          setTimeout(() => {
            const element = marker.getElement();
            element.style.animation = 'pulse 2s infinite';
          }, index * 200);
        });

        // Add connecting lines (optional visual enhancement)
        map.current.addSource('connections', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: tenderLocations.map(tender => ({
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [[2.3597, 48.8323], [tender.lng, tender.lat]]
              }
            }))
          }
        });

        map.current.addLayer({
          id: 'connections',
          type: 'line',
          source: 'connections',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3B82F6',
            'line-width': 1,
            'line-opacity': 0.3,
            'line-dasharray': [2, 2]
          }
        });
      });

    } catch (error) {
      console.log('Mapbox token required for map functionality');
      // Fallback: show a placeholder
      if (mapContainer.current) {
        mapContainer.current.innerHTML = `
          <div class="flex items-center justify-center h-full bg-muted rounded-lg">
            <div class="text-center p-6">
              <div class="text-2xl mb-2">🗺️</div>
              <p class="text-muted-foreground">Paris Tender Map</p>
              <p class="text-sm text-muted-foreground mt-2">Interactive map showing tender opportunities</p>
            </div>
          </div>
        `;
      }
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-80 lg:h-96">
      <div ref={mapContainer} className="absolute inset-0 rounded-xl shadow-medium" />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
        <p className="text-sm font-medium text-foreground">Tender Opportunities in Paris</p>
        <div className="flex items-center gap-4 mt-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Your Company</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-muted-foreground">Available Tenders</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParisMap;