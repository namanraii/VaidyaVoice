/** Custom hook for device geolocation and emergency hospital finder. */
import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface Hospital {
  name: string;
  distance: number; // km
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
}

// Static fallback data for rural Varanasi area PHCs (replace with real API)
const STATIC_HOSPITALS: Hospital[] = [
  { name: 'Sarnath PHC', distance: 2.1, address: 'Sarnath, Varanasi', phone: '0542-123456', latitude: 25.3713, longitude: 83.0238 },
  { name: 'Varanasi District Hospital', distance: 5.4, address: 'Varanasi City', phone: '0542-234567', latitude: 25.3176, longitude: 82.9739 },
  { name: 'Shivpur CHC', distance: 3.8, address: 'Shivpur, Varanasi', phone: '0542-345678', latitude: 25.3551, longitude: 82.9722 },
];

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const requestLocation = useCallback(async () => {
    // Default fallback coordinates for Varanasi
    let finalCoords = { latitude: 25.3176, longitude: 82.9739 };
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied, using fallback.');
      } else {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        finalCoords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      }
    } catch (err) {
      console.warn('Failed to get location, using fallback.', err);
    }
    
    setLocation(finalCoords);

    // Fetch nearby hospitals using Overpass API
    try {
      const radius = 5000; // 5km
      const query = `
        [out:json];
        (
          node["amenity"~"hospital|clinic"](around:${radius},${finalCoords.latitude},${finalCoords.longitude});
          way["amenity"~"hospital|clinic"](around:${radius},${finalCoords.latitude},${finalCoords.longitude});
        );
        out center 5;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      
      if (response.ok) {
        const data = await response.json();
        const liveHospitals: Hospital[] = data.elements.map((el: any) => {
          const lat = el.lat || el.center?.lat;
          const lon = el.lon || el.center?.lon;
          
          // Haversine rough approximation for km distance
          const dLat = (lat - finalCoords.latitude) * Math.PI / 180;
          const dLon = (lon - finalCoords.longitude) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(finalCoords.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

          return {
            name: el.tags?.name || 'Local Clinic',
            distance: Number(dist.toFixed(1)),
            address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || 'Nearby Location',
            phone: el.tags?.phone || 'Emergency: 108',
            latitude: lat,
            longitude: lon,
          };
        }).sort((a: Hospital, b: Hospital) => a.distance - b.distance);
        
        if (liveHospitals.length > 0) {
          setHospitals(liveHospitals);
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to fetch from Overpass API', error);
    }

    // Fallback to static if live fetch fails or returns 0 results
    const sortedFallback = STATIC_HOSPITALS.map(h => {
       const dLat = (h.latitude - finalCoords.latitude) * Math.PI / 180;
       const dLon = (h.longitude - finalCoords.longitude) * Math.PI / 180;
       const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(finalCoords.latitude * Math.PI / 180) * Math.cos(h.latitude * Math.PI / 180) * 
                 Math.sin(dLon/2) * Math.sin(dLon/2);
       const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
       return { ...h, distance: Number(dist.toFixed(1)) };
    }).sort((a, b) => a.distance - b.distance);

    setHospitals(sortedFallback);
    return true;
  }, []);

  return {
    location,
    error,
    hospitals,
    requestLocation,
  };
}
