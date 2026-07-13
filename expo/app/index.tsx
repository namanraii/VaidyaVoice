/** Screen 1: Language + Mic Recording — the voice entry point.
 * Big mic button, language picker, waveform while recording.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ImageBackground, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { COLORS } from '../constants/colors';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useTriageApi } from '../hooks/useTriageApi';
import MicButton from '../components/MicButton';
import Waveform from '../components/Waveform';

const LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi', labelLocal: 'हिंदी' },
  { code: 'en-IN', label: 'English', labelLocal: 'English' },
  { code: 'bn-IN', label: 'Bengali', labelLocal: 'বাংলা' },
  { code: 'te-IN', label: 'Telugu', labelLocal: 'తెలుగు' },
  { code: 'mr-IN', label: 'Marathi', labelLocal: 'मराठी' },
  { code: 'ta-IN', label: 'Tamil', labelLocal: 'தமிழ்' },
  { code: 'gu-IN', label: 'Gujarati', labelLocal: 'ગુજરાતી' },
  { code: 'kn-IN', label: 'Kannada', labelLocal: 'ಕನ್ನಡ' },
  { code: 'or-IN', label: 'Odia', labelLocal: 'ଓଡ଼ିଆ' },
  { code: 'ml-IN', label: 'Malayalam', labelLocal: 'മലയാളം' },
  { code: 'pa-IN', label: 'Punjabi', labelLocal: 'ਪੰਜਾਬੀ' },
  { code: 'as-IN', label: 'Assamese', labelLocal: 'অসমীয়া' },
];

export default function MicScreen() {
  const router = useRouter();
  const recorder = useAudioRecorder();
  const triage = useTriageApi();
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    recorder.requestPermission();
  }, []);

  const handleRecordStart = useCallback(() => {
    recorder.startRecording();
  }, [recorder]);

  const handleRecordStop = useCallback(async () => {
    const result = await recorder.stopRecording();
    if (!result) return;

    setIsProcessing(true);
    const sessionId = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Date.now().toString()
    );

    const triageResult = await triage.submitAudio({
      audio_b64: result.base64,
      session_id: sessionId.slice(0, 16),
      language: selectedLang,
    });

    setIsProcessing(false);

    if (triageResult) {
      router.push({
        pathname: '/result',
        params: { result: JSON.stringify(triageResult) },
      });
    }
  }, [recorder, triage, selectedLang, router]);

  // Test with text (for dev without audio)
  const handleTestText = useCallback(async () => {
    const testText = 'मुझे बुखार और सिरदर्द है';
    const sessionId = 'test_' + Date.now();
    setIsProcessing(true);
    const triageResult = await triage.submitText(testText, sessionId, selectedLang);
    setIsProcessing(false);
    if (triageResult) {
      router.push({
        pathname: '/result',
        params: { result: JSON.stringify(triageResult) },
      });
    }
  }, [triage, selectedLang, router]);

  const activeLang = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  return (
    <ImageBackground 
      source={require('../assets/bg_pattern.jpg')} 
      style={styles.container}
      imageStyle={{ opacity: 1, resizeMode: 'cover' }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>VaidyaVoice</Text>
        <Text style={styles.subtitle}>Speak your symptoms in your own language</Text>
        <Text style={styles.trustSignal}>🎙️ Voice → 🧠 AI Analysis → 🏥 Triage</Text>
      </View>

      <View style={styles.langContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langScrollContainer}>
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang.code}
              style={[
                styles.langChip,
                selectedLang === lang.code && styles.langChipActive,
              ]}
              onPress={() => setSelectedLang(lang.code)}
            >
              <Text style={[styles.langChipText, selectedLang === lang.code && styles.langChipTextActive]}>
                {lang.labelLocal}
              </Text>
              <Text style={[styles.langSubText, selectedLang === lang.code && styles.langChipTextActive]}>
                {lang.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Waveform */}
      <View style={styles.waveformContainer}>
        <Waveform recorder={recorder} isRecording={recorder.isRecording} />
      </View>

      {/* Mic Button */}
      <View style={styles.micContainer}>
        <MicButton
          isRecording={recorder.isRecording}
          onPress={handleRecordStart}
          onRelease={handleRecordStop}
        />
      </View>

      {/* Instructions */}
      <Text style={styles.instructions}>
        {recorder.isRecording
          ? 'Listening... Release to send'
          : 'Hold the mic button and speak your symptoms'}
      </Text>

      <View style={{ flex: 1 }} />

      {/* Recent Activity Ghost Card */}
      {!recorder.isRecording && !isProcessing && (
        <View style={styles.ghostCard}>
          <Text style={styles.ghostText}>⚡ Recent check: Fever, cough — 2 mins ago</Text>
        </View>
      )}

      {/* Loading */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing your symptoms...</Text>
        </View>
      )}

      {/* Dev test button */}
      <Pressable onPress={handleTestText} style={styles.testButton}>
        <Text style={styles.testText}>Test with sample text</Text>
      </Pressable>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 38,
    color: COLORS.primaryDark || '#cc5a14',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -1,
    fontFamily: 'Nunito_900Black',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.grayDark,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 10,
  },
  trustSignal: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  langContainer: {
    width: '100%',
    marginBottom: 20,
    marginTop: 10,
  },
  langScrollContainer: {
    paddingHorizontal: 20,
    gap: 12,
    alignItems: 'center',
  },
  langChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.glassWhite,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomWidth: 4,
    borderBottomColor: '#cccccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langChipActive: {
    backgroundColor: '#fff4eb',
    borderColor: '#ffa46b',
    borderBottomColor: '#cc5a14',
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
  langChipText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.grayDark,
  },
  langSubText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  langChipTextActive: {
    color: '#cc5a14',
  },
  waveformContainer: {
    height: 100,
    justifyContent: 'center',
    marginBottom: 24,
  },
  micContainer: {
    marginVertical: 24,
  },
  instructions: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ghostCard: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 20,
    marginBottom: 80,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  ghostText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250, 248, 245, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 17,
    color: COLORS.primaryDark,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  testButton: {
    position: 'absolute',
    bottom: 20,
    padding: 12,
  },
  testText: {
    color: COLORS.gray,
    fontSize: 13,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
