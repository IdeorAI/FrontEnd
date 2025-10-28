"use client";

import { Check, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stage {
  number: number;
  name: string;
  phase: string; // etapa1, etapa2, etc
}

const STAGES: Stage[] = [
  { number: 1, name: "Problema e Oportunidade", phase: "etapa1" },
  { number: 2, name: "Pesquisa de Mercado", phase: "etapa2" },
  { number: 3, name: "Proposta de Valor", phase: "etapa3" },
  { number: 4, name: "Modelo de Negócio", phase: "etapa4" },
  { number: 5, name: "MVP", phase: "etapa5" },
  { number: 6, name: "Equipe Mínima", phase: "etapa6" },
  { number: 7, name: "Pitch Deck & Plano", phase: "etapa7" },
];

interface StageProgressProps {
  currentStage: string; // etapa1, etapa2, etc
  completedStages: string[]; // ['etapa1', 'etapa2']
  onStageClick?: (phase: string) => void;
}

export function StageProgress({
  currentStage,
  completedStages,
  onStageClick,
}: StageProgressProps) {
  const getCurrentStageNumber = () => {
    const stage = STAGES.find((s) => s.phase === currentStage);
    return stage?.number || 1;
  };

  const isCompleted = (phase: string) => completedStages.includes(phase);
  const isCurrent = (phase: string) => phase === currentStage;
  const isAccessible = (stageNumber: number) => {
    const currentNumber = getCurrentStageNumber();
    return stageNumber <= currentNumber;
  };

  return (
    <div className="w-full py-6">
      {/* Desktop: Horizontal */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {STAGES.map((stage, index) => (
            <div key={stage.phase} className="flex items-center flex-1">
              {/* Stage Circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() =>
                    isAccessible(stage.number) && onStageClick?.(stage.phase)
                  }
                  disabled={!isAccessible(stage.number)}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8c7dff]",
                    isCompleted(stage.phase) &&
                      "bg-[#8c7dff] text-white hover:bg-[#7a6de6]",
                    isCurrent(stage.phase) &&
                      !isCompleted(stage.phase) &&
                      "bg-[#8c7dff]/20 text-[#8c7dff] border-2 border-[#8c7dff]",
                    !isCurrent(stage.phase) &&
                      !isCompleted(stage.phase) &&
                      isAccessible(stage.number) &&
                      "bg-gray-200 text-gray-600 hover:bg-gray-300",
                    !isAccessible(stage.number) &&
                      "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isCompleted(stage.phase) ? (
                    <Check className="w-6 h-6" />
                  ) : isAccessible(stage.number) ? (
                    <Circle className="w-6 h-6" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </button>
                <span
                  className={cn(
                    "mt-2 text-xs text-center max-w-[120px] leading-tight",
                    (isCompleted(stage.phase) || isCurrent(stage.phase)) &&
                      "text-[#8c7dff] font-medium",
                    !isCompleted(stage.phase) &&
                      !isCurrent(stage.phase) &&
                      "text-gray-500"
                  )}
                >
                  {stage.name}
                </span>
              </div>

              {/* Connector Line */}
              {index < STAGES.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-colors",
                    isCompleted(stage.phase)
                      ? "bg-[#8c7dff]"
                      : "bg-gray-300"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Vertical */}
      <div className="md:hidden space-y-4">
        {STAGES.map((stage) => (
          <div key={stage.phase} className="flex items-center gap-4">
            <button
              onClick={() =>
                isAccessible(stage.number) && onStageClick?.(stage.phase)
              }
              disabled={!isAccessible(stage.number)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8c7dff]",
                isCompleted(stage.phase) &&
                  "bg-[#8c7dff] text-white",
                isCurrent(stage.phase) &&
                  !isCompleted(stage.phase) &&
                  "bg-[#8c7dff]/20 text-[#8c7dff] border-2 border-[#8c7dff]",
                !isCurrent(stage.phase) &&
                  !isCompleted(stage.phase) &&
                  isAccessible(stage.number) &&
                  "bg-gray-200 text-gray-600",
                !isAccessible(stage.number) &&
                  "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {isCompleted(stage.phase) ? (
                <Check className="w-5 h-5" />
              ) : isAccessible(stage.number) ? (
                <Circle className="w-5 h-5" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </button>
            <div>
              <p
                className={cn(
                  "text-sm font-medium",
                  (isCompleted(stage.phase) || isCurrent(stage.phase)) &&
                    "text-[#8c7dff]",
                  !isCompleted(stage.phase) &&
                    !isCurrent(stage.phase) &&
                    "text-gray-600"
                )}
              >
                Etapa {stage.number}
              </p>
              <p className="text-xs text-gray-500">{stage.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
