import React, { useEffect, useRef } from "react";
import {
  Animated,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface FloatingOrbProps {
  onPress: () => void;
  isListening?: boolean;
  isLoading?: boolean;
}

export default function FloatingOrb({
  onPress,
  isListening = false,
  isLoading = false,
}: FloatingOrbProps) {
  const colors = useColors();
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const pos = useRef(new Animated.ValueXY({ x: 20, y: 300 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => {
        pos.extractOffset();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pos.x, dy: pos.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pos.flattenOffset();
      },
    })
  ).current;

  useEffect(() => {
    if (isListening || isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulse.stopAnimation();
      rotation.stopAnimation();

      Animated.spring(pulse, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.08,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isListening, isLoading]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  const orbColor = isListening
    ? colors.neonGreen
    : isLoading
    ? colors.neonGold
    : colors.neonBlue;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: pos.x }, { translateY: pos.y }] },
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderColor: orbColor,
            opacity: glowOpacity,
            transform: [{ scale: pulse }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.outerRing,
          {
            borderColor: orbColor,
            transform: [{ rotate: spin }, { scale: pulse }],
          },
        ]}
      />
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Animated.View
          style={[
            styles.orb,
            {
              backgroundColor: orbColor,
              shadowColor: orbColor,
              transform: [{ scale: pulse }],
            },
          ]}
        >
          <View style={[styles.orbInner, { backgroundColor: "#030308" }]} />
          <View style={[styles.orbCore, { backgroundColor: orbColor }]} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  glowRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.8,
  },
  outerRing: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderStyle: "dashed",
    opacity: 0.6,
  },
  orb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    shadowOpacity: 0.9,
    elevation: 12,
  },
  orbInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    position: "absolute",
    opacity: 0.7,
  },
  orbCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    opacity: 0.9,
  },
});
