import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import type { Message } from "@/context/ChatContext";
import { executeCommand } from "@/services/AndroidCommands";
import { speak } from "@/services/VoiceService";

interface ChatMessageProps {
  message: Message;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const colors = useColors();
  const isUser = message.role === "user";
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isUser ? 30 : -30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
  }, []);

  const handleSpeak = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await speak(message.content);
  };

  const handleExecuteCommand = async () => {
    if (!message.command) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await executeCommand(message.command);
    console.log("Command result:", result);
  };

  const bubbleStyle = isUser
    ? {
        backgroundColor: "rgba(0,212,255,0.15)",
        borderColor: colors.neonBlue,
        borderWidth: 1,
        alignSelf: "flex-end" as const,
      }
    : {
        backgroundColor: "rgba(123,47,255,0.1)",
        borderColor: "rgba(123,47,255,0.3)",
        borderWidth: 1,
        alignSelf: "flex-start" as const,
      };

  const cursorColor = message.isStreaming ? colors.neonBlue : "transparent";

  return (
    <Animated.View
      style={[
        styles.container,
        {
          alignItems: isUser ? "flex-end" : "flex-start",
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.neonPurple }]}>
          <Ionicons name="flash" size={14} color="#fff" />
        </View>
      )}
      <View style={[styles.bubble, bubbleStyle]}>
        {message.isStreaming && !message.content ? (
          <View style={styles.typingRow}>
            <TypingDot delay={0} color={colors.neonBlue} />
            <TypingDot delay={200} color={colors.neonBlue} />
            <TypingDot delay={400} color={colors.neonBlue} />
          </View>
        ) : (
          <Text style={[styles.content, { color: colors.foreground }]}>
            {message.content}
            {message.isStreaming && (
              <Text style={{ color: cursorColor }}>▊</Text>
            )}
          </Text>
        )}

        {!isUser && !message.isStreaming && message.content && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleSpeak} style={styles.actionBtn}>
              <Ionicons name="volume-medium" size={14} color={colors.neonBlue} />
            </TouchableOpacity>
            {message.command && (
              <TouchableOpacity
                onPress={handleExecuteCommand}
                style={[styles.actionBtn, styles.commandBtn]}
              >
                <Ionicons name="play-circle" size={14} color={colors.neonGreen} />
                <Text style={[styles.commandText, { color: colors.neonGreen }]}>
                  تنفيذ
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <Text style={[styles.time, { color: colors.textDim }]}>
        {formatTime(message.timestamp)}
      </Text>
    </Animated.View>
  );
}

function TypingDot({ delay, color }: { delay: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: color,
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -4],
              }),
            },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    maxWidth: "85%",
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 60,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  time: {
    fontSize: 10,
    marginTop: 3,
    marginHorizontal: 4,
    fontFamily: "Inter_400Regular",
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  actionBtn: {
    padding: 4,
    opacity: 0.8,
  },
  commandBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(0,255,136,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,255,136,0.3)",
  },
  commandText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
