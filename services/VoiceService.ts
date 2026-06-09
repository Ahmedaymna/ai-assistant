import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { Platform } from "react-native";

export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await Audio.requestPermissionsAsync();
  return status === "granted";
}

export async function speak(text: string, language: string = "ar"): Promise<void> {
  const cleanText = text.replace(/[*_~`#]/g, "").trim();
  if (!cleanText) return;

  const isAvailable = await Speech.isSpeakingAsync();
  if (isAvailable) {
    await Speech.stop();
  }

  return new Promise((resolve, reject) => {
    Speech.speak(cleanText, {
      language: language === "ar" ? "ar-SA" : "en-US",
      pitch: 1.0,
      rate: 0.9,
      onDone: resolve,
      onError: reject,
    });
  });
}

export async function stopSpeaking(): Promise<void> {
  await Speech.stop();
}

export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

export function detectLanguage(text: string): string {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text) ? "ar" : "en";
}
