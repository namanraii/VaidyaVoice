/** Screen 3: Graph Visualization — animated reasoning path.
 * Shows how the graph connected symptoms → condition → medicine → interaction.
 */
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { COLORS } from '../constants/colors';
import GraphVisualizer from '../components/GraphVisualizer';

export default function GraphVizScreen() {
  const { reasoning } = useLocalSearchParams<{ reasoning: string }>();
  const reasoningPath = reasoning ? JSON.parse(reasoning) : {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Graph Reasoning</Text>
        <Text style={styles.subtitle}>
          This is how VaidyaVoice connected your symptoms to conditions through the knowledge graph.
        </Text>
      </View>

      <GraphVisualizer reasoningPath={reasoningPath} />

      <View style={styles.explanation}>
        <Text style={styles.explanationTitle}>Why a graph?</Text>
        <Text style={styles.explanationText}>
          A regular database would look up symptoms in a flat table. A knowledge graph{' '}
          <Text style={styles.bold}>traverses connections</Text>:
        </Text>
        <Text style={styles.step}>1. Your symptom matched multiple conditions</Text>
        <Text style={styles.step}>2. We ranked by weighted evidence (strength of connection)</Text>
        <Text style={styles.step}>3. We checked medicines for that condition</Text>
        <Text style={styles.step}>4. We found a dangerous interaction and suggested a safe alternative</Text>
        <Text style={styles.step}>5. A flat database can't do step 4 in one query</Text>
      </View>
    </ScrollView>
  );
}

import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
    lineHeight: 20,
  },
  explanation: {
    padding: 20,
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 14,
    color: COLORS.grayDark,
    lineHeight: 22,
    marginBottom: 12,
  },
  bold: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  step: {
    fontSize: 13,
    color: COLORS.grayDark,
    paddingVertical: 6,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    marginBottom: 4,
  },
});
