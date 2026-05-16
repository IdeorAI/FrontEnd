"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  content: string;
  /** Quando true, cada seção do accordion vira um textarea editável. */
  editable?: boolean;
  /** Chamado sempre que o usuário edita uma seção (no modo editable). */
  onChange?: (newContent: string) => void;
}

interface Section {
  id: string;
  /** Chave original (JSON) ou título do header (markdown). */
  key: string;
  title: string;
  body: string;
}

type ParsedShape =
  | { kind: "json"; keys: string[]; raw: Record<string, unknown> }
  | { kind: "wrapped-markdown"; markdown: string }
  | { kind: "plain-markdown"; markdown: string };

function humanizeKey(key: string): string {
  return key
    .split(/[_\-\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function valueToMarkdown(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return "";
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

function tryParseJson(content: string): Record<string, unknown> | null {
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
    /* ignore */
  }
  return null;
}

function splitMarkdownIntoSections(markdown: string): Section[] {
  const lines = markdown.split("\n");
  const sections: Section[] = [];
  let currentTitle: string | null = null;
  let currentBody: string[] = [];
  const headerRegex = /^(#{1,4})\s+(.+?)\s*$/;

  const pushSection = () => {
    const body = currentBody.join("\n").trim();
    if (currentTitle || body) {
      const title = currentTitle ?? "Visão Geral";
      sections.push({
        id: `${sections.length}-${title.slice(0, 30)}`,
        key: title,
        title,
        body,
      });
    }
  };

  for (const line of lines) {
    const m = headerRegex.exec(line);
    if (m) {
      pushSection();
      currentTitle = m[2].trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  pushSection();

  return sections;
}

function detectShape(content: string): ParsedShape {
  const parsed = tryParseJson(content);
  if (!parsed) return { kind: "plain-markdown", markdown: content };

  const keys = Object.keys(parsed);
  if (
    keys.length === 1 &&
    keys[0].toLowerCase() === "content" &&
    typeof parsed.content === "string"
  ) {
    return { kind: "wrapped-markdown", markdown: parsed.content as string };
  }
  return { kind: "json", keys, raw: parsed };
}

function buildSections(shape: ParsedShape): Section[] {
  if (shape.kind === "json") {
    return shape.keys.map((key, idx) => ({
      id: `${idx}-${key}`,
      key,
      title: humanizeKey(key),
      body: valueToMarkdown(shape.raw[key]),
    }));
  }
  const split = splitMarkdownIntoSections(shape.markdown);
  if (split.length > 0) return split;
  return [
    {
      id: "0-conteudo",
      key: "Conteúdo",
      title: "Conteúdo",
      body: shape.markdown,
    },
  ];
}

/** Reconstrói a string completa a partir das seções editadas. */
function reconstruct(
  shape: ParsedShape,
  sections: Section[],
  edits: Record<string, string>
): string {
  if (shape.kind === "json") {
    const next: Record<string, unknown> = { ...shape.raw };
    for (const s of sections) {
      next[s.key] = edits[s.id] ?? s.body;
    }
    return JSON.stringify(next, null, 2);
  }

  // markdown (wrapped ou plain): rebuild como ## Header\n\nbody
  const md = sections
    .map((s) => {
      const body = edits[s.id] ?? s.body;
      if (s.title === "Visão Geral" && sections.indexOf(s) === 0) {
        return body;
      }
      return `## ${s.title}\n\n${body}`;
    })
    .join("\n\n");

  if (shape.kind === "wrapped-markdown") {
    return JSON.stringify({ content: md }, null, 2);
  }
  return md;
}

function AutoGrowTextarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      rows={4}
    />
  );
}

export function DocumentViewer({
  content,
  editable = false,
  onChange,
}: DocumentViewerProps) {
  const shape = useMemo(() => detectShape(content), [content]);
  const sections = useMemo(() => buildSections(shape), [shape]);

  const [edits, setEdits] = useState<Record<string, string>>({});
  // Reset edits quando o content de origem muda externamente
  useEffect(() => {
    setEdits({});
  }, [content]);

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

  const handleSectionEdit = (id: string, newBody: string) => {
    const nextEdits = { ...edits, [id]: newBody };
    setEdits(nextEdits);
    onChange?.(reconstruct(shape, sections, nextEdits));
  };

  if (sections.length === 0) {
    return (
      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
        {content}
      </pre>
    );
  }

  const allExpanded = expandedSections.size === sections.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">
          {sections.length} {sections.length === 1 ? "seção" : "seções"}
          {editable && " · editando"}
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
        const currentBody = edits[section.id] ?? section.body;

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
                {editable ? (
                  <AutoGrowTextarea
                    value={currentBody}
                    onChange={(v) => handleSectionEdit(section.id, v)}
                  />
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1.5 prose-li:my-0.5 prose-headings:mt-3 prose-headings:mb-1 prose-strong:text-foreground">
                    <Markdown>{currentBody}</Markdown>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
