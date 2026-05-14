"use client";

import { useRef, useState, KeyboardEvent } from "react";
import { Sparkles, Send, CheckCheck, RotateCcw, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { streamChat, type ChatMessage, type ChatContext, type DiffEvent, type Error422Event } from "@/lib/api/chat";

interface RefineChatProps {
  stageContent: string;
  stageName: string;
  ctx: ChatContext;
  onApply: (newContent: string) => void;
  className?: string;
}

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getOriginalValue(stageContent: string, key: string): string {
  try {
    const parsed = JSON.parse(stageContent);
    return typeof parsed[key] === "string" ? parsed[key] : JSON.stringify(parsed[key] ?? "");
  } catch {
    return stageContent;
  }
}

export function RefineChat({ stageContent, stageName, ctx, onApply, className }: RefineChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAiContent, setLastAiContent] = useState<string | null>(null);

  // Diff state
  const [diffSections, setDiffSections] = useState<Record<string, string> | null>(null);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [acceptedKeys, setAcceptedKeys] = useState<Set<string>>(new Set());
  const [rejectedKeys, setRejectedKeys] = useState<Set<string>>(new Set());

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setError(null);
    setDiffError(null);
    setDiffSections(null);
    setAcceptedKeys(new Set());
    setRejectedKeys(new Set());

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);

    setIsStreaming(true);
    abortRef.current = new AbortController();

    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      let full = "";
      let pendingDiff: DiffEvent | null = null;
      let pendingError422: Error422Event | null = null;

      for await (const event of streamChat(
        text.trim(),
        messages,
        { ...ctx, mode: "refine", stageContent, stageName } as ChatContext & { mode: string; stageContent: string; stageName: string },
        abortRef.current.signal,
      )) {
        if (typeof event === "string") {
          full += event;
          setMessages(prev => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: full };
            return copy;
          });
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        } else if ((event as DiffEvent).isDiff) {
          pendingDiff = event as DiffEvent;
        } else if ((event as Error422Event).error422) {
          pendingError422 = event as Error422Event;
        }
      }

      setLastAiContent(full);

      if (pendingDiff) {
        setDiffSections(pendingDiff.diff.changed_sections);
      } else if (pendingError422) {
        setDiffError(pendingError422.error422);
      }
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

  // Fallback apply (no diff)
  const handleApplyFallback = () => {
    if (!lastAiContent) return;
    onApply(lastAiContent);
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setLastAiContent(null);
    setError(null);
    setDiffSections(null);
    setDiffError(null);
    setAcceptedKeys(new Set());
    setRejectedKeys(new Set());
  };

  const toggleAccept = (key: string) => {
    setAcceptedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
    setRejectedKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const toggleReject = (key: string) => {
    setRejectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
    setAcceptedKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const handleAcceptAll = () => {
    if (!diffSections) return;
    setAcceptedKeys(new Set(Object.keys(diffSections)));
    setRejectedKeys(new Set());
  };

  const handleApplyAccepted = () => {
    if (!diffSections || acceptedKeys.size === 0) return;
    let original: Record<string, unknown> = {};
    try { original = JSON.parse(stageContent); } catch { /* raw */ }
    const accepted: Record<string, string> = {};
    acceptedKeys.forEach(k => { accepted[k] = diffSections[k]; });
    const merged = { ...original, ...accepted };
    onApply(JSON.stringify(merged));
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

                  {/* Fallback apply button — only when no diff sections and streaming done */}
                  {isLastAi && !isStreaming && msg.content && !diffSections && (
                    <button
                      onClick={handleApplyFallback}
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

      {/* Diff error */}
      {diffError && (
        <div className="mx-4 mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {diffError}
        </div>
      )}

      {/* Diff cards */}
      {diffSections && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-ink-primary">Alterações sugeridas</span>
            <button
              onClick={handleAcceptAll}
              className="text-xs text-green-700 hover:text-green-800 font-medium transition-colors"
            >
              Aceitar tudo
            </button>
          </div>

          {Object.entries(diffSections).map(([key, newContent]) => {
            const isAccepted = acceptedKeys.has(key);
            const isRejected = rejectedKeys.has(key);
            const original = getOriginalValue(stageContent, key);

            return (
              <div
                key={key}
                className={cn(
                  "rounded-lg border p-4 space-y-3 transition-colors",
                  isAccepted && "border-green-400 bg-green-50/30",
                  isRejected && "border-border bg-muted/30 opacity-60",
                  !isAccepted && !isRejected && "border-border bg-surface-raised",
                )}
              >
                <span className="text-xs font-semibold text-ink-primary">{humanizeKey(key)}</span>

                <div className="space-y-2">
                  <div className="rounded-md bg-gray-100 px-3 py-2">
                    <p className="text-[10px] font-semibold text-ink-muted mb-1 uppercase tracking-wide">Original</p>
                    <p className="text-xs text-ink-secondary whitespace-pre-wrap">{original}</p>
                  </div>
                  <div className="rounded-md bg-green-50 px-3 py-2">
                    <p className="text-[10px] font-semibold text-green-700 mb-1 uppercase tracking-wide">Refinado</p>
                    <p className="text-xs text-ink-primary whitespace-pre-wrap">{newContent}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAccept(key)}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                      isAccepted
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-green-800 hover:bg-green-200",
                    )}
                  >
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                    Aceitar
                  </button>
                  <button
                    onClick={() => toggleReject(key)}
                    className={cn(
                      "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
                      isRejected
                        ? "bg-gray-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    )}
                  >
                    <X className="h-3 w-3" strokeWidth={2.5} />
                    Rejeitar
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={handleApplyAccepted}
            disabled={acceptedKeys.size === 0}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors",
              acceptedKeys.size > 0
                ? "bg-brand text-brand-foreground hover:bg-brand-hover"
                : "bg-muted text-ink-muted cursor-not-allowed opacity-50",
            )}
          >
            <CheckCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
            Aplicar alterações aceitas ({acceptedKeys.size})
          </button>
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
