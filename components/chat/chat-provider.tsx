"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { streamChat, type ChatMessage, type ChatContext } from "@/lib/api/chat";

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isStreaming: boolean;
  error: string | null;
}

interface ChatContextValue extends ChatState {
  context: ChatContext;
  setContext: (ctx: ChatContext) => void;
  sendMessage: (text: string) => Promise<void>;
  clearHistory: () => void;
  toggleOpen: () => void;
  open: () => void;
}

const ChatCtx = createContext<ChatContextValue | null>(null);

const STORAGE_KEY = "ideor_chat_history";
const MAX_HISTORY = 50;

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(msgs: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_HISTORY)));
  } catch { /* storage full */ }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  const [isOpen, setIsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContextState] = useState<ChatContext>({});
  const abortRef = useRef<AbortController | null>(null);

  const setContext = useCallback((ctx: ChatContext) => {
    setContextState(prev => ({ ...prev, ...ctx }));
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    saveHistory(nextMessages);

    setIsStreaming(true);
    abortRef.current = new AbortController();

    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      let full = "";
      for await (const delta of streamChat(
        text.trim(),
        messages,
        context,
        abortRef.current.signal,
      )) {
        full += delta;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: full };
          return updated;
        });
      }
      const final = [...nextMessages, { role: "assistant" as const, content: full }];
      saveHistory(final);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setError(msg);
      setMessages(prev => prev.slice(0, -1)); // remove assistantMsg vazio
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isStreaming, context]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const toggleOpen = useCallback(() => setIsOpen(v => !v), []);
  const open = useCallback(() => setIsOpen(true), []);

  return (
    <ChatCtx.Provider value={{
      messages, isOpen, isStreaming, error,
      context, setContext,
      sendMessage, clearHistory, toggleOpen, open,
    }}>
      {children}
    </ChatCtx.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
}
