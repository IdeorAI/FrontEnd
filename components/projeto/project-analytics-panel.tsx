"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, Clock, Tag, ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractKeywords } from "@/lib/utils/keywords";

const STAGE_NAMES: Record<string, string> = {
  etapa1: "Problema e Oportunidade",
  etapa2: "Pesquisa de Mercado",
  etapa3: "Proposta de Valor",
  etapa4: "Modelo de Negócio",
  etapa5: "MVP",
};

const STAGE_HINTS: Record<string, string> = {
  etapa1: "Documente o problema que sua solução resolve e as personas afetadas.",
  etapa2: "Analise o mercado-alvo, TAM/SAM/SOM e principais concorrentes.",
  etapa3: "Articule o valor único da sua solução e seus diferenciais.",
  etapa4: "Estruture seu Business Model Canvas com fontes de receita e canais.",
  etapa5: "Defina as funcionalidades essenciais do MVP e as métricas de sucesso.",
};

type StageState = "complete" | "pending" | "not-started";

interface Props {
  etapaContent: Record<string, string>;
  completedStages: number[];
  onPublishToMarketplace?: () => void;
}

export function ProjectAnalyticsPanel({ etapaContent, completedStages, onPublishToMarketplace }: Props) {
  // Status de cada etapa 1-5
  const stages = useMemo<{ key: string; name: string; state: StageState }[]>(() => {
    return [1, 2, 3, 4, 5].map((num) => {
      const key = `etapa${num}`;
      const isComplete = completedStages.includes(num);
      const hasContent = !!etapaContent[key];
      const state: StageState = isComplete ? "complete" : hasContent ? "pending" : "not-started";
      return { key, name: STAGE_NAMES[key], state };
    });
  }, [etapaContent, completedStages]);

  // Palavras-chave extraídas do conteúdo de todas as etapas
  const keywords = useMemo(() => {
    const texts = Object.values(etapaContent).filter(Boolean);
    if (texts.length === 0) return [];
    return extractKeywords(texts, 8);
  }, [etapaContent]);

  // Próxima etapa a ser completada
  const nextStage = useMemo(() => {
    return stages.find((s) => s.state !== "complete") ?? null;
  }, [stages]);

  const allComplete = stages.every((s) => s.state === "complete");

  // Não renderizar se não há nenhum conteúdo ainda
  if (Object.keys(etapaContent).length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-5 space-y-5">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Análise do Projeto
      </h2>

      {/* Grid de status das etapas */}
      <div className="grid grid-cols-5 gap-2">
        {stages.map((stage) => (
          <div
            key={stage.key}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            {stage.state === "complete" ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : stage.state === "pending" ? (
              <Clock className="h-6 w-6 text-yellow-500" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground/40" />
            )}
            <span className="text-[10px] leading-tight text-muted-foreground line-clamp-2">
              {stage.name}
            </span>
          </div>
        ))}
      </div>

      {/* Palavras-chave */}
      {keywords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            <span>Palavras-chave do projeto</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Próximo passo ou CTA */}
      {allComplete ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
            <Rocket className="h-4 w-4 flex-shrink-0" />
            Projeto completo! Publique no Marketplace para encontrar parceiros e investidores.
          </div>
          {onPublishToMarketplace && (
            <Button
              size="sm"
              className="gap-2 flex-shrink-0"
              onClick={onPublishToMarketplace}
            >
              <Rocket className="h-3.5 w-3.5" />
              Publicar no Marketplace
            </Button>
          )}
        </div>
      ) : nextStage ? (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
          <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-foreground">
              Próximo passo — {nextStage.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {STAGE_HINTS[nextStage.key]}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
