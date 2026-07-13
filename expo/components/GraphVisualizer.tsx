/** Animated SVG graph showing the reasoning path: symptom → condition → medicine → interaction.
 * This is the "secret weapon" screen that proves native mobile capability.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

interface GraphNode {
  id: string;
  label: string;
  type: 'symptom' | 'condition' | 'medicine' | 'interaction';
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
}

interface GraphVisualizerProps {
  reasoningPath: any;
}

const NODE_COLORS = {
  symptom: COLORS.nodeSymptom,
  condition: COLORS.nodeCondition,
  medicine: COLORS.nodeMedicine,
  interaction: COLORS.nodeInteraction,
};

export default function GraphVisualizer({ reasoningPath }: GraphVisualizerProps) {
  const width = Dimensions.get('window').width - 32;
  const height = 400;

  // Build graph from reasoning path
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  if (reasoningPath) {
    // Symptoms on left
    const symptoms = reasoningPath.symptoms || [];
    symptoms.forEach((s: any, i: number) => {
      nodes.push({
        id: `sym_${i}`,
        label: s.name || s,
        type: 'symptom',
        x: 60,
        y: 80 + i * 60,
      });
      edges.push({ from: `sym_${i}`, to: 'cond' });
    });

    // Condition in center
    nodes.push({
      id: 'cond',
      label: reasoningPath.condition || 'Condition',
      type: 'condition',
      x: width / 2,
      y: height / 2 - 20,
    });

    // Medicines on right
    const medicines = reasoningPath.medicines || [];
    medicines.forEach((m: string, i: number) => {
      nodes.push({
        id: `med_${i}`,
        label: m,
        type: 'medicine',
        x: width - 60,
        y: 60 + i * 50,
      });
      edges.push({ from: 'cond', to: `med_${i}` });
    });

    // Interactions below
    const interactions = reasoningPath.interactions || [];
    interactions.forEach((inter: any, i: number) => {
      if (inter.from && inter.to) {
        nodes.push({
          id: `int_${i}`,
          label: '⚠',
          type: 'interaction',
          x: width - 60,
          y: height - 60 - i * 40,
        });
        edges.push({ from: `med_0`, to: `int_${i}` });
      }
    });
  }

  // Animation values
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 2000,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    opacity: progress.value,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How VaidyaVoice Thinks</Text>
      <Text style={styles.subtitle}>Graph reasoning path</Text>

      <Svg width={width} height={height} style={styles.svg}>
        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodes.find(n => n.id === edge.from);
          const toNode = nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          return (
            <AnimatedLine
              key={`edge_${i}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={COLORS.edgeDefault}
              strokeWidth={2}
              animatedProps={animatedProps}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <G key={node.id}>
            <AnimatedCircle
              cx={node.x}
              cy={node.y}
              r={18}
              fill={NODE_COLORS[node.type]}
              animatedProps={animatedProps}
            />
            <SvgText
              x={node.x}
              y={node.y + 30}
              fontSize="10"
              fill={COLORS.grayDark}
              textAnchor="middle"
              fontWeight="bold"
            >
              {node.label}
            </SvgText>
          </G>
        ))}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.nodeSymptom }]} />
          <Text style={styles.legendText}>Symptom</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.nodeCondition }]} />
          <Text style={styles.legendText}>Condition</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.nodeMedicine }]} />
          <Text style={styles.legendText}>Medicine</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.nodeInteraction }]} />
          <Text style={styles.legendText}>Interaction</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  svg: {
    backgroundColor: COLORS.grayLight,
    borderRadius: 12,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.grayDark,
  },
});
