// components/manual-stage-form.tsx
// Spec 024 — formulário de etapa no MODO MANUAL (Colaborativo).
// Cada subitem é um textarea de texto livre.
// - Auto-save: ao sair de um campo, o rascunho parcial é salvo (status 'draft').
//   Não conta como concluída, não dispara IVO/Score, sobrevive a sair da tela.
// - "Concluir etapa": só habilita quando TODOS os subitens estão preenchidos;
//   salva 'evaluated' (dispara IVO/Score + summary) e segue para o dash.
"use client";

import { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, Sparkles, Wand2, Loader2, Check } from "lucide-react";
import { getManualSubitems, MANUAL_STAGE_CONFIGS } from "@/lib/manual-stage-configs";
import { saveManualStage } from "@/lib/api/manual-stages";
import { assistSubitem, reviewSubitem } from "@/lib/api/subitem-assist";

interface ManualStageFormProps {
  projectId: string;
  userId: string;
  phase: string; // "etapa1".."etapa5"
  /** Conteúdo já salvo (JSON { key: texto }) para reabrir a etapa preenchida. */
  initialContent?: string | null;
  /** Chamado após CONCLUIR com sucesso (ex.: navegar para o dash). */
  onSaved?: () => void;
}

type DraftStatus = "idle" | "saving" | "saved";

function parseInitial(content?: string | null): Record<string, string> {
  if (!content) return {};
  try {
    const obj = JSON.parse(content);
    if (obj && typeof obj === "object") {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj)) {
        out[k] = typeof v === "string" ? v : JSON.stringify(v);
      }
      return out;
    }
  } catch {
    /* ignore — conteúdo não-JSON */
  }
  return {};
}

export function ManualStageForm({
  projectId,
  userId,
  phase,
  initialContent,
  onSaved,
}: ManualStageFormProps) {
  const config = MANUAL_STAGE_CONFIGS[phase];
  const subitems = getManualSubitems(phase);
  const [values, setValues] = useState<Record<string, string>>(() =>
    parseInitial(initialContent)
  );
  const [saving, setSaving] = useState(false);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const [aiBusy, setAiBusy] = useState<Record<string, "assist" | "review" | undefined>>({});

  // Serializa os valores já persistidos para evitar auto-saves redundantes.
  const lastSavedRef = useRef<string>(JSON.stringify(parseInitial(initialContent)));
  // Guard: impede auto-saves CONCORRENTES (que criariam tasks duplicadas).
  const savingRef = useRef(false);
  const pendingRef = useRef<Record<string, string> | null>(null);

  if (!config) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta etapa não está disponível no modo manual.
      </p>
    );
  }

  const setValue = (key: string, v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  // Auto-save do rascunho parcial (status 'draft'). Idempotente (só salva se mudou)
  // e SERIALIZADO: se um save já está em voo, enfileira o último estado e dispara
  // ao terminar — evita POSTs concorrentes que criariam tasks duplicadas.
  const persistDraft = async (next: Record<string, string>) => {
    const serialized = JSON.stringify(next);
    if (serialized === lastSavedRef.current) return;

    if (savingRef.current) {
      pendingRef.current = next; // guarda o último; roda quando o atual terminar
      return;
    }

    savingRef.current = true;
    setDraftStatus("saving");
    try {
      await saveManualStage(projectId, phase, next, userId, /* draft */ true);
      lastSavedRef.current = serialized;
      setDraftStatus("saved");
    } catch {
      // Auto-save silencioso — não interrompe o usuário; ele ainda pode concluir.
      setDraftStatus("idle");
    } finally {
      savingRef.current = false;
      // Se algo mudou enquanto salvávamos, persiste o estado mais recente.
      if (pendingRef.current) {
        const queued = pendingRef.current;
        pendingRef.current = null;
        void persistDraft(queued);
      }
    }
  };

  const handleBlur = () => {
    void persistDraft(values);
  };

  const handleAssist = async (key: string, label: string) => {
    setAiBusy((p) => ({ ...p, [key]: "assist" }));
    try {
      const text = await assistSubitem(projectId, phase, key, label, userId);
      const next = { ...values, [key]: text };
      setValues(next);
      void persistDraft(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar com IA.");
    } finally {
      setAiBusy((p) => ({ ...p, [key]: undefined }));
    }
  };

  const handleReview = async (key: string, label: string) => {
    const current = (values[key] ?? "").trim();
    if (!current) return;
    setAiBusy((p) => ({ ...p, [key]: "review" }));
    try {
      const text = await reviewSubitem(projectId, phase, key, label, current, userId);
      const next = { ...values, [key]: text };
      setValues(next);
      void persistDraft(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao revisar com IA.");
    } finally {
      setAiBusy((p) => ({ ...p, [key]: undefined }));
    }
  };

  // Para CONCLUIR, TODOS os subitens precisam estar preenchidos.
  const filledCount = subitems.filter((s) => (values[s.key] ?? "").trim().length > 0).length;
  const allFilled = filledCount === subitems.length;

  const handleSubmit = async () => {
    if (!allFilled) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      for (const s of subitems) payload[s.key] = (values[s.key] ?? "").trim();
      await saveManualStage(projectId, phase, payload, userId, /* draft */ false);
      lastSavedRef.current = JSON.stringify(payload);
      toast.success("Etapa concluída!");
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao concluir a etapa.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="mb-1 text-lg font-semibold text-[#8c7dff]">{config.title}</h3>
      <p className="mb-6 text-sm text-muted-foreground">{config.description}</p>

      <div className="space-y-6">
        {subitems.map((s) => (
          <div key={s.key}>
            <label
              htmlFor={`manual-${s.key}`}
              className="mb-1 block text-sm font-semibold"
            >
              {s.label}
            </label>
            <Textarea
              id={`manual-${s.key}`}
              value={values[s.key] ?? ""}
              onChange={(e) => setValue(s.key, e.target.value)}
              onBlur={handleBlur}
              placeholder={s.placeholder}
              rows={4}
              className="resize-none rounded-xl"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAssist(s.key, s.label)}
                disabled={!!aiBusy[s.key]}
                className="rounded-lg text-xs"
              >
                {aiBusy[s.key] === "assist" ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                )}
                Gerar com IA
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleReview(s.key, s.label)}
                disabled={!!aiBusy[s.key] || !(values[s.key] ?? "").trim()}
                className="rounded-lg text-xs"
              >
                {aiBusy[s.key] === "review" ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                )}
                Revisar com IA
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {draftStatus === "saving" && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando rascunho…
            </>
          )}
          {draftStatus === "saved" && (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Rascunho salvo
            </>
          )}
          <span>
            {filledCount}/{subitems.length} preenchidos
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={handleSubmit}
            disabled={!allFilled || saving}
            className="rounded-xl font-semibold"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {saving ? "Concluindo..." : "Concluir etapa"}
          </Button>
          {!allFilled && (
            <span className="text-xs text-muted-foreground">
              Preencha todos os campos para concluir e avançar.
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
