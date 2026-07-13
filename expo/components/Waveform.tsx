/** Real-time audio waveform visualization using expo-audio. */
import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useAudioSampleListener } from 'expo-audio';
import { COLORS } from '../constants/colors';

interface WaveformProps {
  recorder: any; // AudioRecorder instance
  isRecording: boolean;
}

export default function Waveform({ recorder, isRecording }: WaveformProps) {
  if (Platform.OS === 'web') {
    const [samples, setSamples] = React.useState<number[]>(Array(40).fill(5));

    useEffect(() => {
      if (!isRecording) {
        setSamples(Array(40).fill(5));
        return;
      }

      let animationFrameId: number;
      let frameCount = 0;

      const animate = () => {
        frameCount++;
        // Update 4 bars per frame to look like a rolling wave
        if (frameCount % 4 === 0) {
          setSamples((prev) => {
            const next = [...prev.slice(2)];
            // push 2 new random heights between 10 and 60
            next.push(Math.random() * 50 + 10);
            next.push(Math.random() * 50 + 10);
            return next;
          });
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();
      return () => cancelAnimationFrame(animationFrameId);
    }, [isRecording]);

    return (
      <View style={styles.container}>
        {samples.map((height, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              { 
                height, 
                backgroundColor: !isRecording ? COLORS.primary : height > 45 ? COLORS.red : COLORS.primary 
              }
            ]}
          />
        ))}
      </View>
    );
  }

  return <NativeWaveform recorder={recorder} isRecording={isRecording} />;
}

function NativeWaveform({ recorder, isRecording }: WaveformProps) {
  const [samples, setSamples] = React.useState<number[]>(Array(40).fill(5));

  useAudioSampleListener(recorder, (sample) => {
    if (!isRecording || !sample.channels[0]) return;
    const frames = sample.channels[0].frames;
    const amplitude = frames.reduce((a: number, b: number) => a + Math.abs(b), 0) / frames.length;
    const scaled = Math.min(Math.max(amplitude * 1000, 5), 60);
    
    setSamples(prev => {
      const next = [...prev.slice(1), scaled];
      return next;
    });
  });

  if (!isRecording) {
    return (
      <View style={styles.container}>
        {samples.map((_, i) => (
          <View key={i} style={[styles.bar, { height: 5 }]} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {samples.map((height, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            { height, backgroundColor: height > 40 ? COLORS.red : COLORS.primary },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    gap: 4,
  },
  bar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});
