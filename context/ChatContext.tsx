import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  command?: ParsedCommand | null;
}

export interface ParsedCommand {
  action: string;
  params: Record<string, string>;
}

interface ChatContextValue {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  isListening: boolean;
  setIsListening: (v: boolean) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const STORAGE_KEY = "@ai_assistant_messages";
const MAX_STORED_MESSAGES = 50;

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function parseCommand(text: string): ParsedCommand | null {
  const match = text.match(/\[COMMAND:(\{.*?\})\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function cleanContent(text: string): string {
  return text.replace(/\[COMMAND:\{.*?\}\]/g, "").trim();
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Message[];
          const restored = parsed.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }));
          setMessages(restored);
        } catch {
        }
      }
    });
  }, []);

  const persistMessages = useCallback((msgs: Message[]) => {
    const toStore = msgs.slice(-MAX_STORED_MESSAGES);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toStore)).catch(() => {});
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      const assistantId = generateId();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      const newMessages = [...messages, userMsg, assistantMsg];
      setMessages(newMessages);
      setIsLoading(true);

      abortRef.current = new AbortController();

      try {
        const { SYSTEM_PROMPT } = await import("@/constants/commands");

        const historyForAPI = messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const domain = process.env.EXPO_PUBLIC_DOMAIN;
        const baseUrl = domain ? `https://${domain}` : "";

        const response = await fetch(`${baseUrl}/api/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...historyForAPI,
                { role: "user", content: content.trim() },
              ],
              stream: true,
            }),
            signal: abortRef.current.signal,
          });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`API error: ${response.status} - ${err}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  fullContent += delta;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: cleanContent(fullContent) }
                        : m
                    )
                  );
                }
              } catch {
              }
            }
          }
        }

        const command = parseCommand(fullContent);
        const finalMessages = [...messages, userMsg, {
          ...assistantMsg,
          content: cleanContent(fullContent),
          isStreaming: false,
          command,
        }];

        setMessages(finalMessages);
        persistMessages(finalMessages);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const errorContent =
          "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مجدداً.\nSorry, connection error. Please try again.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: errorContent, isStreaming: false }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, persistMessages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        sendMessage,
        clearMessages,
        isListening,
        setIsListening,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
