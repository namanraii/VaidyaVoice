/** Horizontal scrollable symptom chips extracted from transcript. */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';

interface SymptomChipsProps {
  symptoms: string[];
}

export default function SymptomChips({ symptoms }: SymptomChipsProps) {
  if (!symptoms || symptoms.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Extracted Symptoms</Text>
      <View style={styles.chipContainer}>
        {symptoms.map((symptom, index) => (
          <View key={index} style={styles.chip}>
            <Text style={styles.chipText}>{symptom}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 13,
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    fontWeight: '700',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chipText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '600',
  },
});
