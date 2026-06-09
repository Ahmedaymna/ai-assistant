import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useChat } from "@/context/ChatContext";
import ChatMessage from "@/components/ChatMessage";
import VoiceButton from "@/components/VoiceButton";
import NeuralBackground from "@/components/NeuralBackground";
import GlowCard from "@/components/GlowCard";

const { width } = Dimensions.get("window");

const QUICK_PROMPTS = [
  { ar: "افتح يوتيوب", en: "Open YouTube" },
  { ar: "كم الساعة؟", en: "What time is it?" },
  { ar: "ابحث عن الطقس", en: "Search weather" },
  { ar: "افتح الإعدادات", en: "Open settings" },
];

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText("");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sendMessage(text);
  }, [inputText, isLoading, sendMessage]);

  const handleVoiceInput = useCallback(
    async (text: string) => {
      if (!text) return;
      await sendMessage(text);
    },
    [sendMessage]
  );

  const handleQuickPrompt = useCallback(
    async (prompt: string) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await sendMessage(prompt);
    },
    [sendMessage]
  );

  const handleClear = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearMessages();
  }, [clearMessages]);

  const webTopPad = Platform.OS === "web" ? 67 : 0;
  const webBottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.root, { backgroundColor: "#030308" }]}>
      <NeuralBackground />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={[styles.header, { paddingTop: webTopPad }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.orbDot, { backgroundColor: colors.neonBlue }]} />
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              AI
            </Text>
            <Text style={[styles.headerSub, { color: colors.neonBlue }]}>
              ASSISTANT
            </Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={18} color={colors.textDim} />
            </TouchableOpacity>
          )}
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            data={[...messages].reverse()}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <ChatMessage message={item} />}
            inverted
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={!!messages.length}
            ListHeaderComponent={
              messages.length > 0 ? null : (
                <View style={styles.emptyContainer}>
                  <View
                    style={[
                      styles.emptyOrb,
                      { borderColor: colors.neonBlue },
                    ]}
                  >
                    <Ionicons
                      name="flash"
                      size={40}
                      color={colors.neonBlue}
                    />
                  </View>
                  <Text
                    style={[styles.emptyTitle, { color: colors.foreground }]}
                  >
                    مرحباً
                  </Text>
                  <Text
                    style={[styles.emptySubtitle, { color: colors.textDim }]}
                  >
                    كيف يمكنني مساعدتك؟
                  </Text>
                  <View style={styles.quickPromptsRow}>
                    {QUICK_PROMPTS.map((p) => (
                      <TouchableOpacity
                        key={p.ar}
                        onPress={() => handleQuickPrompt(p.ar)}
                        activeOpacity={0.7}
                      >
                        <GlowCard
                          style={styles.quickChip}
                          intensity="low"
                        >
                          <Text
                            style={[
                              styles.quickChipText,
                              { color: colors.neonBlue },
                            ]}
                          >
                            {p.ar}
                          </Text>
                        </GlowCard>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )
            }
          />

          <View
            style={[
              styles.inputBar,
              {
                borderTopColor: colors.glassBorder,
                paddingBottom: insets.bottom + webBottomPad + 8,
              },
            ]}
          >
            <GlowCard
              style={styles.inputContainer}
              intensity="low"
            >
              <TextInput
                ref={inputRef}
                value={inputText}
                onChangeText={setInputText}
                placeholder="اكتب رسالة أو أمر..."
                placeholderTextColor={colors.textDim}
                style={[
                  styles.input,
                  { color: colors.foreground },
                ]}
                multiline
                maxLength={500}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
                returnKeyType="send"
                textAlign="right"
              />
              <View style={styles.inputActions}>
                <VoiceButton
                  onVoiceInput={handleVoiceInput}
                  isLoading={isLoading}
                />
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={!inputText.trim() || isLoading}
                  activeOpacity={0.7}
                  style={[
                    styles.sendBtn,
                    {
                      backgroundColor:
                        inputText.trim() && !isLoading
                          ? colors.neonBlue
                          : "rgba(0,212,255,0.15)",
                      borderColor: colors.neonBlue,
                    },
                  ]}
                >
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={
                      inputText.trim() && !isLoading
                        ? colors.background
                        : colors.neonBlue
                    }
                  />
                </TouchableOpacity>
              </View>
            </GlowCard>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,212,255,0.15)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orbDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },
  headerSub: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    letterSpacing: 4,
    marginTop: 2,
  },
  clearBtn: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 16,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyOrb: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginBottom: 32,
  },
  quickPromptsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    maxWidth: width - 40,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  inputBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 120,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "center",
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
