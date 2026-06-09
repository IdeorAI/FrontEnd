"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Save,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DreTable, type DreData } from "@/components/dre-table";

interface DocumentViewerProps {
  content: string;
  /** Chamado quando usuário clica Salvar numa seção específica. */
  onSectionSave?: (key: string, newValue: string) => Promise<void>;
  /** Chamado quando usuário pede para refinar uma seção via IA. */
  onSectionRefine?: (
    key: string,
    sectionTitle: string,
    currentValue: string,
    feedback: string,
    signal?: AbortSignal
  ) => Promise<string>;
  /** Chamado quando a DRE (chave "dre") é editada. Persiste o objeto inteiro. */
  onDreSave?: (dre: DreData) => Promise<void>;
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

function AutoGrowTextarea({
  value,
  onChange,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
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
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        readOnly && "opacity-70 cursor-not-allowed"
      )}
      rows={4}
    />
  );
}

interface SectionCardProps {
  section: Section;
  index: number;
  isOpen: boolean;
  onToggle: (id: string) => void;
  isEditing: boolean;
  isOtherSectionEditing: boolean;
  editValue: string;
  setEditValue: (v: string) => void;
  showRefineInput: boolean;
  setShowRefineInput: React.Dispatch<React.SetStateAction<boolean>>;
  refineFeedback: string;
  setRefineFeedback: (v: string) => void;
  refineSuggestion: string | null;
  setRefineSuggestion: (v: string | null) => void;
  saving: boolean;
  refining: boolean;
  onEnterEdit: (section: Section) => void;
  onCancelEdit: () => void;
  onSave: (section: Section) => void;
  onRefine: (section: Section) => void;
  canEdit: boolean;
  canRefine: boolean;
}

function SectionCard({
  section,
  index,
  isOpen,
  onToggle,
  isEditing,
  isOtherSectionEditing,
  editValue,
  setEditValue,
  showRefineInput,
  setShowRefineInput,
  refineFeedback,
  setRefineFeedback,
  refineSuggestion,
  setRefineSuggestion,
  saving,
  refining,
  onEnterEdit,
  onCancelEdit,
  onSave,
  onRefine,
  canEdit,
  canRefine,
}: SectionCardProps) {
  const busy = saving || refining;
  const headerId = `accordion-header-${section.id}`;
  const panelId = `accordion-panel-${section.id}`;

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-200",
        isOpen ? "border-border shadow-sm" : "border-border/50"
      )}
    >
      <h3 className="m-0">
        <button
          type="button"
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(section.id)}
          className={cn(
            "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
            <ChevronUp aria-hidden="true" className="w-4 h-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown aria-hidden="true" className="w-4 h-4 shrink-0 text-muted-foreground" />
          )}
        </button>
      </h3>

      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          aria-busy={busy || undefined}
          className="px-4 pb-4 pt-2 border-t border-border/50 space-y-3"
        >
          {isEditing ? (
            <>
              <AutoGrowTextarea
                value={editValue}
                onChange={setEditValue}
                readOnly={busy}
              />

              {showRefineInput && canRefine && (
                <div className="flex flex-col gap-3 rounded-md border border-border/60 bg-muted/30 p-3">
                  <label className="text-xs font-medium text-muted-foreground">
                    O que deseja ajustar nesta seção?
                  </label>
                  <textarea
                    value={refineFeedback}
                    onChange={(e) => setRefineFeedback(e.target.value)}
                    disabled={refining}
                    rows={2}
                    placeholder="Ex: tornar mais conciso, adicionar exemplo prático..."
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => onRefine(section)}
                      disabled={refining || !refineFeedback.trim()}
                    >
                      {refining ? (
                        <Loader2 aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Sparkles aria-hidden="true" className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Gerar sugestão
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8"
                      onClick={() => {
                        setShowRefineInput(false);
                        setRefineFeedback("");
                        setRefineSuggestion(null);
                      }}
                      disabled={refining}
                    >
                      Fechar
                    </Button>
                  </div>

                  {refineSuggestion && (
                    <div className="mt-1 rounded-2xl rounded-tl-sm border border-primary/20 bg-primary/5 p-3 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                          <Sparkles aria-hidden="true" className="w-3.5 h-3.5" />
                          Sugestão da IA
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(refineSuggestion);
                                toast.success("Sugestão copiada para a área de transferência");
                              } catch {
                                toast.error("Não foi possível copiar. Selecione o texto manualmente.");
                              }
                            }}
                          >
                            Copiar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => setRefineSuggestion(null)}
                          >
                            <X aria-hidden="true" className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {refineSuggestion}
                      </div>
                      <p className="italic text-xs text-muted-foreground border-t border-border/40 pt-2">
                        Se gostou desta sugestão, copie o trecho desejado acima e cole no documento original (textarea acima), substituindo a parte que quiser melhorar. O documento <strong>não foi alterado automaticamente</strong>.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  className="h-8 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onSave(section)}
                  disabled={busy}
                >
                  {saving ? (
                    <Loader2 aria-hidden="true" className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Save aria-hidden="true" className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={onCancelEdit}
                  disabled={busy}
                >
                  <X aria-hidden="true" className="w-3.5 h-3.5 mr-1.5" />
                  Cancelar
                </Button>
                {canRefine && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => setShowRefineInput((v) => !v)}
                    disabled={busy}
                    aria-expanded={showRefineInput}
                  >
                    <Sparkles aria-hidden="true" className="w-3.5 h-3.5 mr-1.5" />
                    Refinar com IA
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1.5 prose-li:my-0.5 prose-headings:mt-3 prose-headings:mb-1 prose-strong:text-foreground">
                <Markdown rehypePlugins={[rehypeSanitize]}>{section.body}</Markdown>
              </div>
              {canEdit && (
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    className="h-9 gap-2 bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors font-medium shadow-sm"
                    onClick={() => onEnterEdit(section)}
                    disabled={isOtherSectionEditing}
                  >
                    <Edit2 aria-hidden="true" className="w-4 h-4" />
                    Editar esta seção
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function DocumentViewer({
  content,
  onSectionSave,
  onSectionRefine,
  onDreSave,
}: DocumentViewerProps) {
  const shape = useMemo(() => detectShape(content), [content]);
  const sections = useMemo(() => buildSections(shape), [shape]);

  // Objeto bruto da DRE (chave "dre"), quando o JSON da etapa a contém.
  const dreRaw = useMemo(
    () =>
      shape.kind === "json" && shape.raw["dre"] && typeof shape.raw["dre"] === "object"
        ? (shape.raw["dre"] as Partial<DreData>)
        : null,
    [shape]
  );

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id))
  );

  // Estado de edição por seção (1 por vez)
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Estado de refine
  const [showRefineInput, setShowRefineInput] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState("");
  const [refining, setRefining] = useState(false);
  // Sugestão da IA — NÃO sobrescreve o documento. Usuário copia manualmente.
  const [refineSuggestion, setRefineSuggestion] = useState<string | null>(null);

  // Reset ao trocar content externamente
  useEffect(() => {
    setEditingKey(null);
    setEditValue("");
    setShowRefineInput(false);
    setRefineFeedback("");
    setRefineSuggestion(null);
  }, [content]);

  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = () => {
    if (expandedSections.size === sections.length) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set(sections.map((s) => s.id)));
    }
  };

  const enterEdit = useCallback((section: Section) => {
    setEditingKey(section.key);
    setEditValue(section.body);
    setShowRefineInput(false);
    setRefineFeedback("");
    setRefineSuggestion(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingKey(null);
    setEditValue("");
    setShowRefineInput(false);
    setRefineFeedback("");
    setRefineSuggestion(null);
  }, []);

  const handleSave = useCallback(async (section: Section) => {
    if (!onSectionSave) return;
    setSaving(true);
    try {
      await onSectionSave(section.key, editValue);
      setEditingKey(null);
      setEditValue("");
      setShowRefineInput(false);
      setRefineFeedback("");
      setRefineSuggestion(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar seção";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [onSectionSave, editValue]);

  const handleRefine = useCallback(async (section: Section) => {
    if (!onSectionRefine) return;
    if (!refineFeedback.trim()) {
      toast.error("Descreva o que deseja refinar");
      return;
    }
    const keyAtStart = section.key;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);
    setRefining(true);
    try {
      const refined = await onSectionRefine(
        section.key,
        section.title,
        editValue,
        refineFeedback,
        controller.signal
      );
      // Guard: usuário trocou de seção durante a chamada
      if (editingKey !== keyAtStart) {
        toast.info("Refinamento descartado (seção foi trocada)");
        return;
      }
      setRefineSuggestion(refined);
      // Mantém o input de refine aberto para mostrar a sugestão dentro da caixa de chat.
      setShowRefineInput(true);
      setRefineFeedback("");
      toast.success("Sugestão gerada. Revise e copie o que quiser para o documento.");
    } catch (err) {
      if (err instanceof Error && (err.name === "AbortError" || controller.signal.aborted)) {
        toast.error("Tempo esgotado (60s). Tente reformular a instrução.");
      } else {
        const msg = err instanceof Error ? err.message : "Erro ao refinar seção";
        toast.error(msg);
      }
    } finally {
      clearTimeout(timeoutId);
      setRefining(false);
    }
  }, [onSectionRefine, refineFeedback, editValue, editingKey]);

  if (sections.length === 0) {
    return (
      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
        {content}
      </pre>
    );
  }

  const allExpanded = expandedSections.size === sections.length;
  const canEdit = !!onSectionSave;
  const canRefine = !!onSectionRefine;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">
          {sections.length} {sections.length === 1 ? "seção" : "seções"}
          {editingKey && " · editando"}
        </span>
        <button
          type="button"
          onClick={toggleAll}
          aria-label={allExpanded ? "Recolher todas as seções" : "Expandir todas as seções"}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {allExpanded ? "Recolher tudo" : "Expandir tudo"}
        </button>
      </div>

      {sections.map((section, index) => {
        const isOpen = expandedSections.has(section.id);
        const isEditing = editingKey === section.key;

        // Hook dedicado: a chave "dre" vira uma tabela editável, não uma seção genérica.
        if (section.key === "dre" && dreRaw) {
          return (
            <div key={section.id} className="rounded-lg border border-border bg-card p-3 sm:p-4">
              <h3 className="text-sm font-semibold mb-3">Demonstração de Resultado (DRE)</h3>
              <DreTable dre={dreRaw} onSave={onDreSave} />
            </div>
          );
        }

        return (
          <SectionCard
            key={section.id}
            section={section}
            index={index}
            isOpen={isOpen}
            onToggle={toggleSection}
            isEditing={isEditing}
            isOtherSectionEditing={editingKey !== null && !isEditing}
            editValue={editValue}
            setEditValue={setEditValue}
            showRefineInput={showRefineInput}
            setShowRefineInput={setShowRefineInput}
            refineFeedback={refineFeedback}
            setRefineFeedback={setRefineFeedback}
            refineSuggestion={refineSuggestion}
            setRefineSuggestion={setRefineSuggestion}
            saving={saving}
            refining={refining}
            onEnterEdit={enterEdit}
            onCancelEdit={cancelEdit}
            onSave={handleSave}
            onRefine={handleRefine}
            canEdit={canEdit}
            canRefine={canRefine}
          />
        );
      })}
    </div>
  );
}

