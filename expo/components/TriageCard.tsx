/** Color-coded triage card with condition, advice, and severity. */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutAnimation, UIManager, Platform } from 'react-native';
import { COLORS } from '../constants/colors';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface TriageCardProps {
  triageLevel: 'green' | 'yellow' | 'red';
  topCondition: string;
  severityScore?: number;
  advice: string;
  isEmergency: boolean;
  isPlaying?: boolean;
  onPlayAudio?: () => void;
  reasoningPath?: any;
}

export default function TriageCard({
  triageLevel,
  topCondition,
  severityScore = 0,
  advice,
  isEmergency,
  isPlaying,
  onPlayAudio,
  reasoningPath,
}: TriageCardProps) {
  const [showReasoning, setShowReasoning] = useState(false);

  const toggleReasoning = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowReasoning(!showReasoning);
  };

  const levelConfig = {
    green: {
      bg: COLORS.greenLight,
      border: COLORS.green,
      icon: '✓',
      label: 'Self-Care',
      labelLocal: 'घर पर देखभाल',
    },
    yellow: {
      bg: COLORS.yellowLight,
      border: COLORS.yellow,
      icon: '⚠',
      label: 'See a Doctor',
      labelLocal: 'डॉक्टर से मिलें',
    },
    red: {
      bg: COLORS.redLight,
      border: COLORS.red,
      icon: '🚨',
      label: 'Emergency',
      labelLocal: 'आपातकाल',
    },
  };

  const config = levelConfig[triageLevel];

  // Map 0-1 score to 0-100%
  const severityPercent = Math.min(Math.max(severityScore * 100, 5), 100);

  return (
    <View style={[styles.card, { backgroundColor: config.bg, borderColor: config.border }]}>
      <View style={styles.header}>
        <Text style={[styles.icon, { color: config.border }]}>{config.icon}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.label, { color: config.border }]}>{config.label}</Text>
          <Text style={[styles.labelLocal, { color: config.border }]}>{config.labelLocal}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.conditionRow}>
        <View style={styles.conditionInfo}>
          <Text style={styles.conditionLabel}>Possible Condition</Text>
          <Text style={styles.condition}>{topCondition.replace(/_/g, ' ')}</Text>
        </View>
        <View style={styles.severityContainer}>
          <Text style={styles.severityLabel}>Severity</Text>
          <View style={styles.severityBar}>
            <View style={[styles.severityFill, { width: `${severityPercent}%`, backgroundColor: config.border }]} />
          </View>
          <View style={styles.severityScale}>
            <Text style={styles.severityScaleText}>Low</Text>
            <Text style={styles.severityScaleText}>High</Text>
          </View>
        </View>
      </View>

      <Text style={styles.adviceLabel}>What to do</Text>
      <Text style={styles.advice}>{advice}</Text>

      {isEmergency && (
        <View style={[styles.emergencyBanner, { backgroundColor: config.border }]}>
          <Text style={styles.emergencyText}>🚨 Go to nearest hospital immediately</Text>
        </View>
      )}

      {showReasoning && (
        <View style={styles.reasoningContainer}>
          <Text style={styles.reasoningTitle}>How AI determined this:</Text>
          {reasoningPath && reasoningPath.symptoms?.length > 0 ? (
            <View style={styles.reasoningFlow}>
              <View style={styles.symptomList}>
                {reasoningPath.symptoms.map((s: any, i: number) => (
                  <View key={i} style={styles.reasoningChip}>
                    <Text style={styles.reasoningChipText}>{s.name}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.arrow}>➔</Text>
              <View style={[styles.reasoningChip, { backgroundColor: config.border, borderColor: config.border }]}>
                <Text style={[styles.reasoningChipText, { color: COLORS.white }]}>{topCondition.replace(/_/g, ' ')}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.reasoningFallback}>Semantic match via GraphRAG (No exact symptom nodes found)</Text>
          )}
          {severityScore > 0 && (
            <Text style={styles.matchScore}>Severity Score: {(severityScore * 100).toFixed(0)}%</Text>
          )}
        </View>
      )}

      <View style={styles.actions}>
        {onPlayAudio && (
          <Pressable onPress={onPlayAudio} style={styles.actionButton}>
            <Text style={styles.actionText}>{isPlaying ? '🔊 Playing...' : '▶ Play Advice'}</Text>
          </Pressable>
        )}
        <Pressable onPress={toggleReasoning} style={[styles.actionButton, styles.whyButton]}>
          <Text style={styles.whyText}>{showReasoning ? 'Hide reasoning' : 'Why this result?'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    margin: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    backgroundColor: COLORS.glassWhite,
    backdropFilter: 'blur(10px)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  label: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  labelLocal: {
    fontSize: 15,
    opacity: 0.7,
    marginTop: 2,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 20,
  },
  conditionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  conditionInfo: {
    flex: 1,
  },
  conditionLabel: {
    fontSize: 13,
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  condition: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
    marginTop: 6,
  },
  severityContainer: {
    width: 80,
    alignItems: 'flex-end',
  },
  severityLabel: {
    fontSize: 10,
    color: COLORS.gray,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  severityBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  severityFill: {
    height: '100%',
    borderRadius: 4,
  },
  severityScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
  },
  severityScaleText: {
    fontSize: 9,
    color: COLORS.gray,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  adviceLabel: {
    fontSize: 13,
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  advice: {
    fontSize: 17,
    color: COLORS.grayDark,
    lineHeight: 26,
    marginTop: 6,
    marginBottom: 20,
  },
  emergencyBanner: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  emergencyText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  reasoningContainer: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  reasoningTitle: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '700',
    marginBottom: 12,
  },
  reasoningFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
  },
  reasoningChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reasoningChipText: {
    fontSize: 12,
    color: COLORS.grayDark,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  matchScore: {
    fontSize: 11,
    color: COLORS.primaryDark,
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  reasoningFallback: {
    fontSize: 13,
    color: COLORS.gray,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffa46b',
    borderBottomWidth: 4,
    borderBottomColor: '#cc5a14',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  actionText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 15,
  },
  whyButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderBottomWidth: 4,
    borderBottomColor: '#cccccc',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  whyText: {
    color: COLORS.grayDark,
    fontWeight: '800',
    fontSize: 15,
  },
});
