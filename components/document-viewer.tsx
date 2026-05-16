"use client";

import React, { useState } from "react";
import Markdown from "react-markdown";
import { ChevronDown, ChevronRight } from "lucide-react";

interface DocumentViewerProps {
  content: string; // JSON string or plain text
}

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function valueToMarkdown(value: unknown, depth = 0): string {
  if (value === null || value === undefined) return "_Não definido_";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "_Lista vazia_";
    return value
      .map((item) =>
        typeof item === "object" && item !== null
          ? valueToMarkdown(item, depth + 1)
          : `- ${item}`
      )
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        const heading = "#".repeat(Math.min(depth + 3, 6));
        return `${heading} ${humanizeKey(k)}\n\n${valueToMarkdown(v, depth + 1)}`;
      })
      .join("\n\n");
  }

  return String(value);
}

export function DocumentViewer({ content }: DocumentViewerProps) {
  // Parse JSON — strip optional markdown fences first
  let parsed: Record<string, unknown> | null = null;
  try {
    let s = content.trim();
    if (s.startsWith("```")) {
      s = s.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    const result = JSON.parse(s);
    // Handle double-encoded JSON
    if (typeof result === "string") {
      parsed = JSON.parse(result) as Record<string, unknown>;
    } else if (typeof result === "object" && result !== null) {
      parsed = result as Record<string, unknown>;
    }
  } catch {
    // Not valid JSON — will render as plain text
  }

  const topLevelKeys = parsed ? Object.keys(parsed) : [];

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(topLevelKeys)
  );

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Fallback: not valid JSON
  if (!parsed) {
    return (
      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
        {content}
      </pre>
    );
  }

  return (
    <div className="divide-y divide-border rounded-md border">
      {topLevelKeys.map((key) => {
        const isOpen = expandedSections.has(key);
        const markdownBody = valueToMarkdown(parsed![key]);

        return (
          <div key={key}>
            <button
              onClick={() => toggleSection(key)}
              className="flex w-full items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <span className="text-sm font-semibold">{humanizeKey(key)}</span>
              {isOpen ? (
                <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            {isOpen && (
              <div className="px-4 py-3">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <Markdown>{markdownBody}</Markdown>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
