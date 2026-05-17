"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitBetaFeedback } from "@/lib/api/beta-feedback";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const MIN_INTERVAL_MS = 30_000;
let lastSubmitAt = 0;

export function BetaFeedbackModal({ open, onOpenChange }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const validate = () => {
    const next: { title?: string; description?: string } = {};
    const t = title.trim();
    const d = description.trim();
    if (t.length < 1) next.title = "Informe um título";
    else if (t.length > 100) next.title = "Máximo 100 caracteres";
    if (d.length < 10) next.description = "Descreva com pelo menos 10 caracteres";
    else if (d.length > 2000) next.description = "Máximo 2000 caracteres";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const now = Date.now();
    if (now - lastSubmitAt < MIN_INTERVAL_MS) {
      toast.error("Aguarde alguns segundos antes de enviar novamente");
      return;
    }
    setSubmitting(true);
    try {
      await submitBetaFeedback({ title, description });
      lastSubmitAt = Date.now();
      toast.success("Obrigado! Recebemos seu feedback");
      setTitle("");
      setDescription("");
      setErrors({});
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar feedback";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar feedback</DialogTitle>
          <DialogDescription>Seu feedback ajuda a melhorar o IdeorAI</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="bf-title" className="text-sm font-medium">Título</label>
            <Input
              id="bf-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Resumo em uma linha"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "bf-title-err" : undefined}
              disabled={submitting}
            />
            {errors.title && (
              <p id="bf-title-err" className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="bf-desc" className="text-sm font-medium">Descrição</label>
            <Textarea
              id="bf-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="Descreva com detalhes (passos para reproduzir, expectativa, etc)"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "bf-desc-err" : "bf-desc-count"}
              disabled={submitting}
            />
            <div className="flex justify-between items-center">
              {errors.description ? (
                <p id="bf-desc-err" className="text-xs text-destructive">{errors.description}</p>
              ) : (
                <span />
              )}
              <span id="bf-desc-count" className="text-xs text-muted-foreground">
                {description.length}/2000
              </span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />}
              {submitting ? "Enviando..." : "Enviar feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
