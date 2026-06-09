import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

interface GlowCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  intensity?: "low" | "medium" | "high";
}

export default function GlowCard({
  children,
  style,
  glowColor,
  intensity = "medium",
}: GlowCardProps) {
  const colors = useColors();
  const glow = glowColor || colors.neonBlue;

  const shadowRadius = intensity === "low" ? 8 : intensity === "medium" ? 16 : 24;
  const shadowOpacity = intensity === "low" ? 0.2 : intensity === "medium" ? 0.35 : 0.5;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.glass,
          borderColor: colors.glassBorder,
          shadowColor: glow,
          shadowRadius,
          shadowOpacity,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    overflow: "hidden",
  },
});
