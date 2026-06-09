import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";

interface VoiceButtonProps {
  onVoiceInput: (text: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function VoiceButton({
  onVoiceInput,
  isLoading = false,
  disabled = false,
}: VoiceButtonProps) {
  const colors = useColors();
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      Audio.requestPermissionsAsync().then(({ status }) => {
        setHasPermission(status === "granted");
      });
    }
  }, []);

  useEffect(() => {
    if (isListening) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.4,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.spring(pulse, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening]);

  const handlePress = async () => {
    if (disabled || isLoading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (Platform.OS === "web") {
      const text = prompt("Enter voice input (web mode):");
      if (text) onVoiceInput(text);
      return;
    }

    if (!hasPermission) {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") return;
      setHasPermission(true);
    }

    if (isListening) {
      setIsListening(false);
      setTimeout(() => {
        onVoiceInput("مرحبا، كيف حالك؟");
      }, 500);
    } else {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        onVoiceInput("افتح يوتيوب");
      }, 3000);
    }
  };

  const btnColor = isListening
    ? colors.neonGreen
    : disabled || isLoading
    ? colors.textDim
    : colors.neonBlue;

  return (
    <View style={styles.container}>
      {isListening && (
        <Animated.View
          style={[
            styles.ring,
            {
              borderColor: colors.neonGreen,
              transform: [{ scale: pulse }],
              opacity: pulse.interpolate({
                inputRange: [1, 1.4],
                outputRange: [0.5, 0],
              }),
            },
          ]}
        />
      )}
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
        style={[
          styles.button,
          {
            backgroundColor: isListening
              ? "rgba(0,255,136,0.15)"
              : "rgba(0,212,255,0.1)",
            borderColor: btnColor,
          },
        ]}
      >
        <Ionicons
          name={isListening ? "stop-circle" : "mic"}
          size={22}
          color={btnColor}
        />
      </TouchableOpacity>
      {isListening && (
        <Text style={[styles.label, { color: colors.neonGreen }]}>
          استمع...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    marginTop: 3,
    fontFamily: "Inter_500Medium",
  },
});
