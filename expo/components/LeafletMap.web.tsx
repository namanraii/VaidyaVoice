import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icon issues in Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Hospital {
  name: string;
  distance: number;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
}

interface MapProps {
  latitude: number;
  longitude: number;
  hospitals: Hospital[];
}

export default function LeafletMap({ latitude, longitude, hospitals }: MapProps) {
  return (
    <View style={styles.container}>
      <MapContainer 
        center={[latitude, longitude]} 
        zoom={13} 
        style={{ width: '100%', height: '100%', borderRadius: 12 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>You are here</Popup>
        </Marker>
        {hospitals.map((h, i) => (
          <Marker key={i} position={[h.latitude, h.longitude]}>
            <Popup>
              <b>{h.name}</b><br/>{h.address}<br/>{h.distance.toFixed(1)} km
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 12,
  }
});
