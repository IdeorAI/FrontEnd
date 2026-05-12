"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "./chat-provider";
import { ChatDrawer } from "./chat-drawer";

export function ChatFab() {
  const { isOpen, toggleOpen, messages, isStreaming } = useChat();
  const hasMessages = messages.length > 0;

  return (
    <>
      <ChatDrawer />
      <button
        onClick={toggleOpen}
        aria-label="Abrir assistente IdeorAI"
        className={cn(
          "fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200",
          "bg-brand text-brand-foreground hover:bg-brand-hover hover:scale-105 active:scale-95",
          isOpen && "ring-4 ring-brand/30",
        )}
      >
        <Sparkles className={cn("h-6 w-6", isStreaming && "animate-pulse")} />
        {hasMessages && !isOpen && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-card" />
        )}
      </button>
    </>
  );
}
