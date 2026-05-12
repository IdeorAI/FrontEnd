"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { Sparkles, Send, CheckCheck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { streamChat, type ChatMessage, type ChatContext } from "@/lib/api/chat";

interface RefineChatProps {
  stageContent: string;
  stageName: string;
  ctx: ChatContext;
  onApply: (newContent: string) => void;
  className?: string;
}

export function RefineChat({ stageContent, stageName, ctx, onApply, className }: RefineChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAiContent, setLastAiContent] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);

    setIsStreaming(true);
    abortRef.current = new AbortController();

    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      let full = "";
      for await (const delta of streamChat(
        text.trim(),
        messages,
        { ...ctx, mode: "refine", stageContent, stageName } as ChatContext & { mode: string; stageContent: string; stageName: string },
        abortRef.current.signal,
      )) {
        full += delta;
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: full };
          return copy;
        });
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
      setLastAiContent(full);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Erro ao refinar");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
      setInput("");
    }
  };

  const handleSend = () => {
    sendMessage(input);
    setInput("");
  };

  const handleApply = () => {
    if (!lastAiContent) return;
    onApply(lastAiContent);
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setLastAiContent(null);
    setError(null);
  };

  return (
    <div className={cn("rounded-2xl border border-brand/30 bg-brand-subtle/20 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-brand/20">
        <Sparkles className="h-4 w-4 text-ink-brand" strokeWidth={2} />
        <span className="text-sm font-bold text-ink-brand">Refinar com IA</span>
        <span className="ml-1 text-xs text-ink-tertiary">— refinamento iterativo da etapa</span>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="ml-auto flex items-center gap-1 text-xs text-ink-muted hover:text-ink-primary transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Limpar
          </button>
        )}
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            const isLast = i === messages.length - 1;
            const isLastAi = isLast && !isUser;

            return (
              <div key={i} className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
                {!isUser && (
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-brand flex items-center justify-center text-[9px] font-bold text-brand-foreground">
                    IA
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2 text-xs leading-relaxed",
                      isUser
                        ? "bg-brand text-brand-foreground rounded-br-sm"
                        : "bg-surface-raised text-ink-primary border border-border rounded-bl-sm",
                    )}
                  >
                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                    {isStreaming && isLast && !isUser && (
                      <span className="inline-flex gap-0.5 ml-1 align-middle">
                        {[0, 1, 2].map(j => (
                          <span key={j} className="h-1 w-1 rounded-full bg-ink-muted animate-bounce"
                            style={{ animationDelay: `${j * 150}ms` }} />
                        ))}
                      </span>
                    )}
                  </div>

                  {/* Botão aplicar na última mensagem da IA */}
                  {isLastAi && !isStreaming && msg.content && (
                    <button
                      onClick={handleApply}
                      className="self-start flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-brand-foreground hover:bg-brand-hover transition-colors"
                    >
                      <CheckCheck className="h-3 w-3" strokeWidth={2.5} />
                      Aplicar esta versão
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Hint inicial */}
      {messages.length === 0 && (
        <div className="px-4 py-3">
          <p className="text-xs text-ink-tertiary">
            Descreva o que deseja melhorar e a IA vai reescrever o conteúdo com as melhorias. Clique em &ldquo;Aplicar&rdquo; para substituir.
          </p>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-brand/20 px-3 py-2.5 flex items-end gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value.slice(0, 500))}
          onKeyDown={handleKeyDown}
          placeholder="Ex: Detalhe mais o problema de dor com dados quantitativos..."
          rows={2}
          disabled={isStreaming}
          className={cn(
            "flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-xs text-ink-primary placeholder:text-ink-muted",
            "focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50",
          )}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          className="flex-shrink-0 h-8 w-8 rounded-xl bg-brand flex items-center justify-center text-brand-foreground disabled:opacity-40 hover:bg-brand-hover transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
