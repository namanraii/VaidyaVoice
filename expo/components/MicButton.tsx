/** Big pulsing mic button with animated recording state and 3D bevel. */
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Animated, View } from 'react-native';
import { COLORS } from '../constants/colors';

interface MicButtonProps {
  isRecording: boolean;
  onPress: () => void;
  onRelease: () => void;
}

const Particle = ({ active }: { active: boolean }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const size = useRef(Math.random() * 10 + 5).current; // 5 to 15
  const color = useRef(Math.random() > 0.5 ? COLORS.primary : COLORS.red).current;

  useEffect(() => {
    if (!active) {
      scale.setValue(0);
      opacity.setValue(0);
      return;
    }

    const animate = () => {
      // Reset
      scale.setValue(0);
      opacity.setValue(0.8);
      translateX.setValue(0);
      translateY.setValue(0);

      // Random target position (radiating outwards 50-150px)
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      const duration = Math.random() * 1000 + 1000; // 1-2s

      Animated.parallel([
        Animated.timing(scale, {
          toValue: Math.random() * 1.5 + 0.5,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: targetX,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: targetY,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (active) animate(); // loop
      });
    };

    // Random delay start
    setTimeout(() => {
      if (active) animate();
    }, Math.random() * 1000);
    
  }, [active]);

  if (!active) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [
          { translateX },
          { translateY },
          { scale }
        ],
      }}
    />
  );
};

export default function MicButton({ isRecording, onPress, onRelease }: MicButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Stop any existing animation
    pulseAnim.stopAnimation();
    
    if (isRecording) {
      // Active state: calm, slower pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      // Idle state: subtle, slow breathing
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isRecording]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
    onPress();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    onRelease();
  };

  // 36 particles for a denser effect
  const particles = Array.from({ length: 36 }).map((_, i) => (
    <Particle key={i} active={isRecording} />
  ));

  return (
    <View style={styles.container}>
      {/* Particles layer */}
      {particles}

      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.outerRing,
            { transform: [{ scale: pulseAnim }] },
            isRecording && styles.outerRingActive,
          ]}
        />
        <Animated.View
          style={[
            styles.button,
            { transform: [{ scale: scaleAnim }] },
            isRecording && styles.buttonActive,
          ]}
        >
          <Animated.View style={styles.icon}>
            <Animated.View style={[styles.micIcon, isRecording && styles.micIconActive]} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
  },
  outerRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primary + '30',
  },
  outerRingActive: {
    backgroundColor: COLORS.red + '50', // darker pulse
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // 3D Bevel effect
    borderWidth: 2,
    borderColor: '#ffa46b', // highlight
    borderBottomWidth: 8,
    borderBottomColor: '#cc5a14', // 3D shadow
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonActive: {
    backgroundColor: COLORS.red,
    borderColor: '#ff8888',
    borderBottomColor: '#990000',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    width: 40,
    height: 50,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 4,
    borderBottomColor: '#e0e0e0',
  },
  micIconActive: {
    backgroundColor: COLORS.white,
    borderBottomColor: '#ffcccc',
  },
});
