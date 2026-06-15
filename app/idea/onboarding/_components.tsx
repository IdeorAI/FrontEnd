// app/idea/onboarding/_components.tsx
// Spec 025 — UI compartilhada do wizard: barra de progresso, header e footer.
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, X } from "lucide-react";

/** Barra de progresso (rodapé das telas, igual ao padrão do PDF). */
export function OnboardingProgress({
  current,
  total,
}: {
  current: number; // índice 0-based do passo atual
  total: number;
}) {
  const pct = total > 1 ? Math.round(((current + 1) / total) * 100) : 100;
  return (
    <div
      className="mt-8 h-2 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Cabeçalho com título centralizado + botão fechar opcional. */
export function OnboardingHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose?: () => void;
}) {
  return (
    <div className="relative mb-8 text-center">
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-0 top-0"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
      <h1 className="text-balance px-8 text-lg font-bold sm:text-xl">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

/**
 * Rodapé com Voltar / (ações extras) / Próxima.
 * `nextLabel` permite trocar "Próxima etapa" por "Salvar" no último passo.
 */
export function OnboardingFooter({
  onBack,
  onNext,
  nextLabel = "Próxima etapa",
  nextDisabled = false,
  loading = false,
  showBack = true,
  extra,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  showBack?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
      {showBack && (
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={loading}
          className="min-w-[140px] rounded-xl font-semibold"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
      )}
      {extra}
      <Button
        size="lg"
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="min-w-[160px] rounded-xl font-semibold"
      >
        {loading ? "Salvando..." : nextLabel}
        {!loading && nextLabel === "Próxima etapa" && (
          <ArrowRight className="ml-2 h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

/** Wrapper de card padrão das telas do onboarding. */
export function OnboardingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="rounded-3xl border border-border bg-card px-6 py-8 shadow-2xl backdrop-blur-lg sm:px-10 sm:py-10">
        {children}
      </div>
    </div>
  );
}
