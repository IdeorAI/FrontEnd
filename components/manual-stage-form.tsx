// components/manual-stage-form.tsx
// Spec 024 — formulário de etapa no MODO MANUAL (Colaborativo).
// Cada subitem é um textarea de texto livre. "Concluir etapa" salva via backend
// (task 'evaluated' + stage_summary + IVO/Score) e segue para o dash.
"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, Sparkles, Wand2, Loader2 } from "lucide-react";
import { getManualSubitems, MANUAL_STAGE_CONFIGS } from "@/lib/manual-stage-configs";
import { saveManualStage } from "@/lib/api/manual-stages";
import { assistSubitem, reviewSubitem } from "@/lib/api/subitem-assist";

interface ManualStageFormProps {
  projectId: string;
  userId: string;
  phase: string; // "etapa1".."etapa5"
  /** Conteúdo já salvo (JSON { key: texto }) para reabrir a etapa preenchida. */
  initialContent?: string | null;
  /** Chamado após salvar com sucesso (ex.: navegar para o dash). */
  onSaved?: () => void;
}

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
  // Estado de loading da IA por subitem: { [key]: 'assist' | 'review' }.
  const [aiBusy, setAiBusy] = useState<Record<string, "assist" | "review" | undefined>>({});

  if (!config) {
    return (
      <p className="text-sm text-muted-foreground">
        Esta etapa não está disponível no modo manual.
      </p>
    );
  }

  const setValue = (key: string, v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const handleAssist = async (key: string, label: string) => {
    setAiBusy((p) => ({ ...p, [key]: "assist" }));
    try {
      const text = await assistSubitem(projectId, phase, key, label, userId);
      setValue(key, text);
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
      setValue(key, text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao revisar com IA.");
    } finally {
      setAiBusy((p) => ({ ...p, [key]: undefined }));
    }
  };

  // Pelo menos um subitem preenchido para concluir.
  const canSubmit = subitems.some((s) => (values[s.key] ?? "").trim().length > 0);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Envia só os subitens com texto (evita sobrescrever com vazio).
      const payload: Record<string, string> = {};
      for (const s of subitems) {
        const v = (values[s.key] ?? "").trim();
        if (v) payload[s.key] = v;
      }
      await saveManualStage(projectId, phase, payload, userId);
      toast.success("Etapa concluída!");
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar a etapa.");
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

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
          className="rounded-xl font-semibold"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {saving ? "Salvando..." : "Concluir etapa"}
        </Button>
      </div>
    </Card>
  );
}
