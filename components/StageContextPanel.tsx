"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface StageSummary {
  stageNumber: number;
  stageName: string;
  summary: string;
}

interface StageContextPanelProps {
  stages: StageSummary[];
  currentStage: number;
  className?: string;
}

export function StageContextPanel({
  stages,
  currentStage,
  className,
}: StageContextPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filtrar apenas etapas anteriores à atual
  const previousStages = stages.filter(
    (stage) => stage.stageNumber < currentStage
  );

  // Se não houver etapas anteriores, não exibir o painel
  if (previousStages.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "border rounded-lg bg-card overflow-hidden",
        className
      )}
    >
      {/* Header clicável */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <div className="text-left">
            <h3 className="font-semibold text-sm">Contexto Acumulado</h3>
            <p className="text-xs text-muted-foreground">
              {previousStages.length} etapa{previousStages.length > 1 ? "s" : ""} anterior{previousStages.length > 1 ? "es" : ""} completada{previousStages.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {isExpanded ? "Recolher" : "Expandir"}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Conteúdo colapsável */}
      {isExpanded && (
        <div className="border-t">
          <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
            {previousStages.map((stage) => (
              <div
                key={stage.stageNumber}
                className="border-l-2 border-primary/30 pl-4 py-2"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                    Etapa {stage.stageNumber}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stage.stageName}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {stage.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
