import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");
const NUM_NODES = 12;
const NUM_CONNECTIONS = 8;

interface Node {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  baseX: number;
  baseY: number;
}

function createNode(index: number): Node {
  const baseX = Math.random() * width;
  const baseY = Math.random() * height;
  const delay = index * 200;

  const x = new Animated.Value(baseX);
  const y = new Animated.Value(baseY);
  const opacity = new Animated.Value(Math.random() * 0.4 + 0.1);
  const scale = new Animated.Value(Math.random() * 0.5 + 0.5);

  const floatX = () => {
    const dx = (Math.random() - 0.5) * 80;
    Animated.sequence([
      Animated.timing(x, {
        toValue: baseX + dx,
        duration: 3000 + Math.random() * 2000,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(x, {
        toValue: baseX,
        duration: 3000 + Math.random() * 2000,
        useNativeDriver: true,
      }),
    ]).start(() => floatX());
  };

  const floatY = () => {
    const dy = (Math.random() - 0.5) * 80;
    Animated.sequence([
      Animated.timing(y, {
        toValue: baseY + dy,
        duration: 4000 + Math.random() * 2000,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(y, {
        toValue: baseY,
        duration: 4000 + Math.random() * 2000,
        useNativeDriver: true,
      }),
    ]).start(() => floatY());
  };

  const pulse = () => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: Math.random() * 0.6 + 0.2,
        duration: 1500 + Math.random() * 1000,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: Math.random() * 0.2 + 0.05,
        duration: 1500 + Math.random() * 1000,
        useNativeDriver: true,
      }),
    ]).start(() => pulse());
  };

  floatX();
  floatY();
  pulse();

  return { x, y, opacity, scale, baseX, baseY };
}

interface NodeDotProps {
  node: Node;
  color: string;
}

function NodeDot({ node, color }: NodeDotProps) {
  const animStyle = {
    transform: [{ translateX: node.x }, { translateY: node.y }, { scale: node.scale }],
    opacity: node.opacity,
  };
  return (
    <Animated.View style={[styles.node, { backgroundColor: color }, animStyle]} />
  );
}

export default function NeuralBackground() {
  const nodes = useRef<Node[]>(
    Array.from({ length: NUM_NODES }, (_, i) => createNode(i))
  ).current;

  const globalPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(globalPulse, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(globalPulse, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const nodeColors = [
    "#00D4FF",
    "#7B2FFF",
    "#00D4FF",
    "#FFB800",
    "#00FF88",
    "#00D4FF",
    "#7B2FFF",
    "#00D4FF",
    "#FFB800",
    "#00FF88",
    "#00D4FF",
    "#7B2FFF",
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.gradientBg} />
      {nodes.map((node, i) => (
        <NodeDot
          key={i}
          node={node}
          color={nodeColors[i % nodeColors.length]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#030308",
  },
  node: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});
