import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

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
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={{ latitude, longitude }} title="You are here">
          <View style={styles.myLocationMarker}>
            <Text style={styles.markerText}>📍</Text>
          </View>
        </Marker>
        {hospitals.map((h, i) => (
          <Marker
            key={i}
            coordinate={{ latitude: h.latitude, longitude: h.longitude }}
            title={h.name}
            description={h.address}
          >
            <View style={styles.hospitalMarker}>
              <Text style={styles.markerText}>🏥</Text>
            </View>
          </Marker>
        ))}
      </MapView>
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
  },
  map: {
    width: '100%',
    height: '100%',
  },
  myLocationMarker: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  hospitalMarker: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  markerText: {
    fontSize: 16,
  },
});
