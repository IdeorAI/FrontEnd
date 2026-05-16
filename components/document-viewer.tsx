"use client";

import React, { useState } from "react";
import Markdown from "react-markdown";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  content: string; // JSON string or plain text
}

interface Section {
  id: string;
  title: string;
  body: string;
}

function humanizeKey(key: string): string {
  return key
    .split(/[_\-\s]+/)
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

/**
 * Quebra um texto markdown em seções por headers (#, ##, ###).
 * Texto antes do primeiro header vira a primeira seção "Visão Geral".
 */
function splitMarkdownIntoSections(markdown: string): Section[] {
  const lines = markdown.split("\n");
  const sections: Section[] = [];
  let currentTitle: string | null = null;
  let currentBody: string[] = [];
  const headerRegex = /^(#{1,4})\s+(.+?)\s*$/;

  const pushSection = () => {
    const body = currentBody.join("\n").trim();
    if (currentTitle || body) {
      sections.push({
        id: `${sections.length}-${(currentTitle ?? "intro").slice(0, 30)}`,
        title: currentTitle ?? "Visão Geral",
        body,
      });
    }
  };

  for (const line of lines) {
    const match = headerRegex.exec(line);
    if (match) {
      pushSection();
      currentTitle = match[2].trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  pushSection();

  return sections;
}

/**
 * Converte o JSON parseado em uma lista de seções para exibir.
 */
function buildSections(parsed: Record<string, unknown>): Section[] {
  const keys = Object.keys(parsed);

  // Caso especial: backend embrulha texto não-JSON como { content: "..." }
  // Nesse caso, parseamos o markdown interno em seções.
  if (
    keys.length === 1 &&
    keys[0].toLowerCase() === "content" &&
    typeof parsed.content === "string"
  ) {
    const md = parsed.content as string;
    const split = splitMarkdownIntoSections(md);
    if (split.length > 1) return split;
    return [{ id: "0-content", title: "Conteúdo", body: md }];
  }

  // Caso normal: cada chave top-level vira uma seção
  return keys.map((key, idx) => ({
    id: `${idx}-${key}`,
    title: humanizeKey(key),
    body: valueToMarkdown(parsed[key]),
  }));
}

export function DocumentViewer({ content }: DocumentViewerProps) {
  const parsed = parseContent(content);

  // Se não for JSON, tenta tratar como markdown puro
  const sections: Section[] = parsed
    ? buildSections(parsed)
    : splitMarkdownIntoSections(content);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id))
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (expandedSections.size === sections.length) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set(sections.map((s) => s.id)));
    }
  };

  if (sections.length === 0) {
    return (
      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
        {content}
      </pre>
    );
  }

  // Se só tem 1 seção e ela não tem título distinto, mostra direto (sem accordion)
  if (sections.length === 1) {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
        <Markdown>{sections[0].body}</Markdown>
      </div>
    );
  }

  const allExpanded = expandedSections.size === sections.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">
          {sections.length} seções
        </span>
        <button
          onClick={toggleAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          {allExpanded ? "Recolher tudo" : "Expandir tudo"}
        </button>
      </div>

      {sections.map((section, index) => {
        const isOpen = expandedSections.has(section.id);

        return (
          <div
            key={section.id}
            className={cn(
              "rounded-lg border transition-all duration-200",
              isOpen ? "border-border shadow-sm" : "border-border/50"
            )}
          >
            <button
              onClick={() => toggleSection(section.id)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg",
                isOpen ? "bg-primary/5 rounded-b-none" : "hover:bg-muted/60"
              )}
            >
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
                {section.title}
              </span>

              {isOpen ? (
                <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
              )}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-2 border-t border-border/50">
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1.5 prose-li:my-0.5 prose-headings:mt-3 prose-headings:mb-1 prose-strong:text-foreground">
                  <Markdown>{section.body}</Markdown>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
