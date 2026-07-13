/** Screen 2: Triage Result — transcript, symptom chips, color-coded triage card, audio playback. */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AudioModule } from 'expo-audio';
import { COLORS } from '../constants/colors';
import TriageCard from '../components/TriageCard';
import SymptomChips from '../components/SymptomChips';
import LeafletMap from '../components/LeafletMap';
import { useLocation } from '../hooks/useLocation';

const AMBULANCE_NUMBER = '108';

export default function ResultScreen() {
  const router = useRouter();
  const { result } = useLocalSearchParams<{ result: string }>();
  const triageData = useMemo(() => (result ? JSON.parse(result as string) : null), [result]);
  const [isPlaying, setIsPlaying] = useState(false);
  const location = useLocation();
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    // Always request location to show nearby hospitals
    location.requestLocation().then(() => setLocationLoading(false));
  }, [triageData]);

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

  const playAudio = useCallback(async () => {
    if (!triageData?.audio_response_b64) return;
    try {
      if (Platform.OS === 'web') {
        const audio = new Audio(`data:audio/wav;base64,${triageData.audio_response_b64}`);
        setIsPlaying(true);
        await audio.play();
        audio.onended = () => setIsPlaying(false);
      } else {
        const player = new AudioModule.AudioPlayer({
          uri: `data:audio/wav;base64,${triageData.audio_response_b64}`,
        });
        setIsPlaying(true);
        await player.play();
        setTimeout(() => setIsPlaying(false), 5000);
      }
    } catch (err) {
      Alert.alert('Playback Error', 'Could not play audio response');
    }
  }, [triageData]);

  const showReasoning = useCallback(() => {
    router.push({
      pathname: '/graph-viz',
      params: { reasoning: JSON.stringify(triageData?.reasoning_path || {}) },
    });
  }, [router, triageData]);

  if (!triageData) {
    return (
      <View style={styles.center}>
        <Text>No triage data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.resultHeader}>
        <Text style={styles.timestamp}>⏱️ Checked just now</Text>
        <Pressable onPress={() => Alert.alert('Share', 'Opening share sheet...')} style={styles.iconButton}>
          <Text style={{fontSize: 20}}>📤</Text>
        </Pressable>
      </View>

      {/* Transcript */}
      <View style={styles.transcriptCard}>
        <Text style={styles.transcriptLabel}>You said</Text>
        <Text style={styles.transcript}>{triageData.transcript}</Text>
      </View>

      {/* Symptom Chips */}
      <SymptomChips symptoms={triageData.extracted_symptoms} />

      {/* Triage Card */}
      <View style={styles.triageContainer}>
        <TriageCard
          triageLevel={triageData.triage_level}
          topCondition={triageData.top_condition}
          severityScore={triageData.ranked_conditions?.[0]?.severity_score || 0}
          advice={triageData.advice_text}
          isEmergency={triageData.is_emergency}
          isPlaying={isPlaying}
          onPlayAudio={playAudio}
          reasoningPath={triageData.reasoning_path}
        />

        {/* Conditions List */}
        {triageData.ranked_conditions?.length > 1 && (
          <View style={styles.conditionsSection}>
            <Text style={styles.conditionsSubtitle}>Other Possible Conditions</Text>
            <Text style={styles.conditionsCaption}>Match confidence based on symptom overlap</Text>
            {triageData.ranked_conditions?.slice(1, 4).map((cond: any, i: number) => (
              <View key={i} style={styles.conditionRow}>
                <Text style={styles.conditionRank}>#{i + 2}</Text>
                <Text style={styles.conditionName}>{cond.name.replace(/_/g, ' ')}</Text>
                <Text style={styles.conditionScore}>{(cond.confidence * 100).toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Emergency Actions */}
      {triageData.is_emergency && (
        <Pressable onPress={handleCallAmbulance} style={styles.callButton}>
          <Text style={styles.callButtonText}>☎ Call 108 (Ambulance)</Text>
        </Pressable>
      )}

      {/* Location and Hospitals */}
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

      {/* Drug Interactions */}
      {triageData.drug_interactions?.length > 0 && (
        <View style={styles.interactionsSection}>
          <Text style={[styles.sectionTitle, { color: COLORS.red }]}>⚠ Drug Interactions</Text>
          {triageData.drug_interactions.map((inter: any, i: number) => (
            <View key={i} style={styles.interactionCard}>
              <Text style={styles.interactionText}>
                {inter.dangerous_drug} + {inter.patient_drug} ={' '}
                <Text style={styles.interactionSeverity}>{inter.severity} risk</Text>
              </Text>
              {inter.safe_alternatives?.length > 0 && (
                <Text style={styles.alternativeText}>
                  Safe alternative: {inter.safe_alternatives.join(', ')}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Session ID */}
      <Text style={styles.sessionId}>Session: {triageData.session_id}</Text>

      {/* Back button */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Record New Symptoms</Text>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgLight,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
    backgroundColor: COLORS.glassWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  transcriptCard: {
    backgroundColor: COLORS.glassWhite,
    margin: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  transcriptLabel: {
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    fontWeight: '700',
  },
  transcript: {
    fontSize: 17,
    color: COLORS.grayDark,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  triageContainer: {
    marginBottom: 16,
  },
  conditionsSection: {
    marginHorizontal: 16,
    marginTop: -16, // Pull up to connect visually with TriageCard
    paddingTop: 24, // Extra padding to account for overlap
    backgroundColor: COLORS.glassWhite,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderTopWidth: 0,
    zIndex: -1, // Send behind the main card
  },
  conditionsSubtitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.grayDark,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  conditionsCaption: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.grayDark,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  conditionRank: {
    width: 32,
    fontSize: 15,
    color: COLORS.gray,
    fontWeight: '700',
  },
  conditionName: {
    flex: 1,
    fontSize: 16,
    color: COLORS.grayDark,
    fontWeight: '500',
  },
  conditionScore: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '700',
  },
  interactionsSection: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.glassWhite,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  interactionCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  interactionText: {
    fontSize: 15,
    color: COLORS.grayDark,
    lineHeight: 22,
  },
  interactionSeverity: {
    fontWeight: '800',
    color: COLORS.red,
  },
  alternativeText: {
    fontSize: 14,
    color: COLORS.green,
    marginTop: 8,
    fontWeight: '600',
  },
  sessionId: {
    fontSize: 11,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 32,
    letterSpacing: 1,
    opacity: 0.6,
  },
  backButton: {
    margin: 24,
    padding: 18,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  backText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  callButton: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.red,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff8888',
    borderBottomWidth: 4,
    borderBottomColor: '#990000',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  mapSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: COLORS.glassWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.gray,
    fontSize: 15,
  },
  hospitalsSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  hospitalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.glassWhite,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.grayDark,
    marginBottom: 4,
  },
  hospitalDistance: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  hospitalAddress: {
    fontSize: 13,
    color: COLORS.gray,
  },
  hospitalCallButton: {
    backgroundColor: 'rgba(204, 90, 20, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  hospitalCallText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
    fontSize: 14,
  },
});
