import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../constants/colors';
import { useLocation } from '../hooks/useLocation';
import LeafletMap from '../components/LeafletMap';

const AMBULANCE_NUMBER = '108';

export default function EmergencyScreen() {
  const router = useRouter();
  const { result } = useLocalSearchParams<{ result: string }>();
  const triageData = result ? JSON.parse(result) : null;
  const location = useLocation();
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    location.requestLocation().then(() => setLocationLoading(false));
  }, []);

  const handleCallAmbulance = () => {
    Linking.openURL(`tel:${AMBULANCE_NUMBER}`);
  };

  const handleCallHospital = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('No phone', 'Phone number not available for this hospital');
    }
  };

  const hasLocation = location.location && location.location.latitude;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Emergency Header - Glassmorphic */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🚨</Text>
        <Text style={styles.headerTitle}>Emergency Detected</Text>
        <Text style={styles.headerSubtitle}>
          {triageData?.top_condition || 'Possible emergency condition'}
        </Text>
      </View>

      <Pressable onPress={handleCallAmbulance} style={styles.callButton}>
        <Text style={styles.callButtonText}>☎ Call 108 (Ambulance)</Text>
      </Pressable>

      {/* Embedded Map */}
      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>Your Location & Nearby Hospitals</Text>
        {locationLoading ? (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.loadingText}>Locating nearest hospitals...</Text>
          </View>
        ) : hasLocation ? (
          <LeafletMap 
            latitude={location.location!.latitude} 
            longitude={location.location!.longitude} 
            hospitals={location.hospitals} 
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.loadingText}>Location not available</Text>
          </View>
        )}
      </View>

      {/* Nearest Hospitals List */}
      <View style={styles.hospitalsSection}>
        {location.hospitals.map((hospital, index) => (
          <View key={index} style={styles.hospitalCard}>
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>{hospital.name}</Text>
              <Text style={styles.hospitalDistance}>{hospital.distance.toFixed(1)} km away</Text>
              <Text style={styles.hospitalAddress}>{hospital.address}</Text>
            </View>
            <Pressable
              onPress={() => handleCallHospital(hospital.phone)}
              style={styles.hospitalCallButton}
            >
              <Text style={styles.hospitalCallText}>Call</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable onPress={() => router.replace('/')} style={styles.backButton}>
        <Text style={styles.backText}>← Back to Home</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    margin: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.red,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.red,
    marginTop: 4,
    opacity: 0.8,
  },
  callButton: {
    backgroundColor: COLORS.red,
    marginHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
  mapSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.grayDark,
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: COLORS.glassWhite,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  loadingText: {
    color: COLORS.gray,
    fontSize: 15,
  },
  hospitalsSection: {
    marginHorizontal: 16,
  },
  hospitalCard: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.grayDark,
  },
  hospitalDistance: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  hospitalAddress: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
  },
  hospitalCallButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  hospitalCallText: {
    color: COLORS.green,
    fontWeight: '700',
    fontSize: 15,
  },
  backButton: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  backText: {
    color: COLORS.grayDark,
    fontWeight: '600',
    fontSize: 16,
  },
});
