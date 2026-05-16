"use client";

import React, { useState } from "react";
import Markdown from "react-markdown";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  content: string; // JSON string or plain text
}

function humanizeKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function valueToMarkdown(value: unknown): string {
  if (value === null || value === undefined) return "_Não definido_";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "_Lista vazia_";
    return value
      .map((item) =>
        typeof item === "object" && item !== null
          ? valueToMarkdown(item)
          : `- ${item}`
      )
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `**${humanizeKey(k)}:** ${valueToMarkdown(v)}`)
      .join("\n\n");
  }

  return String(value);
}

function parseContent(content: string): Record<string, unknown> | null {
  try {
    let s = content.trim();
    if (s.startsWith("```")) {
      s = s.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    const result = JSON.parse(s);
    if (typeof result === "string") {
      return JSON.parse(result) as Record<string, unknown>;
    }
    if (typeof result === "object" && result !== null) {
      return result as Record<string, unknown>;
    }
  } catch {
    // not JSON
  }
  return null;
}

export function DocumentViewer({ content }: DocumentViewerProps) {
  const parsed = parseContent(content);
  const topLevelKeys = parsed ? Object.keys(parsed) : [];

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(topLevelKeys)
  );

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (expandedSections.size === topLevelKeys.length) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set(topLevelKeys));
    }
  };

  // Fallback: not valid JSON
  if (!parsed || topLevelKeys.length === 0) {
    return (
      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
        {content}
      </pre>
    );
  }

  const allExpanded = expandedSections.size === topLevelKeys.length;

  return (
    <div className="space-y-2">
      {/* Controls row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">
          {topLevelKeys.length} seções
        </span>
        <button
          onClick={toggleAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          {allExpanded ? "Recolher tudo" : "Expandir tudo"}
        </button>
      </div>

      {topLevelKeys.map((key, index) => {
        const isOpen = expandedSections.has(key);
        const markdownBody = valueToMarkdown(parsed[key]);

        return (
          <div
            key={key}
            className={cn(
              "rounded-lg border transition-all duration-200",
              isOpen
                ? "border-border shadow-sm"
                : "border-border/50"
            )}
          >
            {/* Header */}
            <button
              onClick={() => toggleSection(key)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg",
                isOpen
                  ? "bg-primary/5 rounded-b-none"
                  : "hover:bg-muted/60"
              )}
            >
              {/* Number badge */}
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                  isOpen
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </span>

              <span
                className={cn(
                  "flex-1 text-sm font-semibold transition-colors",
                  isOpen ? "text-primary" : "text-foreground"
                )}
              >
                {humanizeKey(key)}
              </span>

              {isOpen ? (
                <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
              )}
            </button>

            {/* Body */}
            {isOpen && (
              <div className="px-4 pb-4 pt-2 border-t border-border/50">
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1.5 prose-li:my-0.5 prose-headings:mt-3 prose-headings:mb-1">
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
