"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { X, Trash2, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "./chat-provider";
import { ChatMessage } from "./chat-message";

const SUGGESTIONS = [
  "O que devo fazer nesta etapa?",
  "Como melhorar meu IVO Index?",
  "O que significa Go ou Pivot?",
  "Como funciona a jornada de validação?",
];

export function ChatDrawer() {
  const { messages, isOpen, isStreaming, error, sendMessage, clearHistory, toggleOpen } = useChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [isOpen, messages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:inset-auto sm:bottom-24 sm:right-5 sm:w-[380px] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-raised">
        <div className="h-7 w-7 rounded-full bg-brand flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-brand-foreground" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-ink-primary">Guia IdeorAI</div>
          <div className="text-[10px] text-ink-tertiary">Assistente de validação de startups</div>
        </div>
        <button
          onClick={clearHistory}
          className="text-ink-muted hover:text-ink-primary transition-colors"
          title="Nova conversa"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button onClick={toggleOpen} className="text-ink-muted hover:text-ink-primary transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-[60vh] sm:max-h-[420px]">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-ink-tertiary text-center">
              Olá! Sou o Guia IdeorAI. Como posso ajudar?
            </p>
            <div className="grid grid-cols-1 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-xs rounded-xl border border-brand/30 bg-brand/5 px-3 py-2 text-ink-brand hover:bg-brand/10 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
            />
          ))
        )}

        {error && (
          <p className="text-xs text-red-500 text-center px-2">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 bg-surface-raised">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 500))}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte algo... (Enter para enviar)"
            rows={1}
            disabled={isStreaming}
            className={cn(
              "flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted",
              "focus:outline-none focus:ring-1 focus:ring-brand",
              "disabled:opacity-50",
              "max-h-28 overflow-y-auto",
            )}
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 h-9 w-9 rounded-xl bg-brand flex items-center justify-center text-brand-foreground disabled:opacity-40 hover:bg-brand-hover transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-[10px] text-ink-tertiary text-right">{input.length}/500</p>
      </div>
    </div>
  );
}
