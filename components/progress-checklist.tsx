// components/progress-checklist.tsx
"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ETAPAS_CHECKLIST = [
  { id: "conta", label: "Conta criada", fase: null },
  { id: "ideia", label: "Primeira ideia descrita", fase: null },
  { id: "mercado", label: "Entenda o potencial do seu mercado", fase: "fase2" },
  { id: "proposta", label: "Valide sua proposta de valor", fase: "fase3" },
  { id: "modelo", label: "Defina seu modelo de negócio", fase: "fase4" },
  { id: "mvp", label: "Construa seu MVP", fase: "fase5" },
  { id: "equipe", label: "Monte sua equipe", fase: "fase6" },
  { id: "pitch", label: "Crie seu Pitch Deck", fase: "fase7" },
];

interface ProgressChecklistProps {
  // Número de etapas concluídas no projeto principal do usuário
  // Os 2 primeiros (conta + ideia) sempre estão completos
  etapasConcluidas: number;
}

export function ProgressChecklist({ etapasConcluidas }: ProgressChecklistProps) {
  const [aberto, setAberto] = useState(true);

  // Índice da próxima etapa a ser completada (após as 2 fixas + etapasConcluidas reais)
  const totalConcluido = 2 + etapasConcluidas;
  const proximaIndex = Math.min(totalConcluido, ETAPAS_CHECKLIST.length - 1);

  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Sua jornada</span>
          <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {totalConcluido}/{ETAPAS_CHECKLIST.length}
          </span>
        </div>
        {/* Botão colapsar em mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 md:hidden"
          onClick={() => setAberto((v) => !v)}
          aria-label={aberto ? "Fechar checklist" : "Abrir checklist"}
        >
          {aberto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Lista */}
      <div className={`space-y-2 ${!aberto ? "hidden md:block" : ""}`}>
        {ETAPAS_CHECKLIST.map((etapa, index) => {
          const concluido = index < totalConcluido;
          const isProximo = index === proximaIndex && !concluido;

          return (
            <div
              key={etapa.id}
              className={`flex items-center gap-2 text-sm ${
                concluido
                  ? "text-muted-foreground line-through"
                  : isProximo
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {concluido ? (
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              ) : (
                <Circle
                  className={`h-4 w-4 flex-shrink-0 ${
                    isProximo ? "text-primary" : "text-muted-foreground/50"
                  }`}
                />
              )}
              <span>{etapa.label}</span>
              {isProximo && (
                <ArrowRight className="h-3 w-3 text-primary ml-auto flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
