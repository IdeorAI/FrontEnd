"use client";

import { cn } from "@/lib/utils";

interface Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

/** Renders **bold**, `code`, bullet lists from markdown text without extra deps. */
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-1">
              <span className="text-ink-muted mt-0.5">•</span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        if (line.startsWith("## ")) return <p key={i} className="font-bold">{renderInline(line.slice(3))}</p>;
        if (line.startsWith("# ")) return <p key={i} className="font-bold">{renderInline(line.slice(2))}</p>;
        if (line === "") return <div key={i} className="h-1" />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // split on **bold** and `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-surface-sunken rounded px-1 text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

export function ChatMessage({ role, content, isStreaming }: Props) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-brand flex items-center justify-center text-[10px] font-bold text-brand-foreground">
          IA
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-brand text-brand-foreground rounded-br-sm"
            : "bg-surface-raised text-ink-primary rounded-bl-sm border border-border",
        )}
      >
        {isUser ? (
          <span>{content}</span>
        ) : (
          <SimpleMarkdown text={content} />
        )}
        {isStreaming && !isUser && (
          <span className="inline-flex gap-0.5 ml-1 align-middle">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-ink-muted animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
