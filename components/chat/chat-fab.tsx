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
          // -15% no tamanho (h-14→h-12) e posicionado ~meio da tela (top-1/2)
          // para não sobrepor os botões de navegação no rodapé das etapas.
          "fixed top-1/2 -translate-y-1/2 right-5 z-50 h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200",
          "bg-brand text-brand-foreground hover:bg-brand-hover hover:scale-105 active:scale-95",
          isOpen && "ring-4 ring-brand/30",
        )}
      >
        <Sparkles className={cn("h-5 w-5", isStreaming && "animate-pulse")} />
        {hasMessages && !isOpen && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-card" />
        )}
      </button>
    </>
  );
}
