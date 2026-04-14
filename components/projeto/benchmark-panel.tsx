"use client";

import { BarChart2, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  projectScore: number;
  projectCategory: string;
  peerProjects: { score: number }[];
}

export function BenchmarkPanel({ projectScore, projectCategory, peerProjects }: Props) {
  if (peerProjects.length < 3) return null;

  const avgScore = Math.round(
    peerProjects.reduce((sum, p) => sum + p.score, 0) / peerProjects.length
  );

  // Exibição em escala 0-10
  const myScore10 = (projectScore / 10).toFixed(1);
  const avg10 = (avgScore / 10).toFixed(1);
  const diff = projectScore - avgScore;
  const diff10 = Math.abs(diff / 10).toFixed(1);
  const isAbove = diff >= 0;

  // Barras comparativas — normalizar para largura máxima 100%
  const maxScore = Math.max(projectScore, avgScore, 10);
  const myWidth = Math.round((projectScore / maxScore) * 100);
  const avgWidth = Math.round((avgScore / maxScore) * 100);

  const categoryLabel = projectCategory
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="border rounded-lg p-5 space-y-4 bg-card">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Benchmark — {categoryLabel}</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {peerProjects.length} projetos analisados
        </span>
      </div>

      {/* Barras comparativas */}
      <div className="space-y-3">
        {/* Seu projeto */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium">Seu projeto</span>
            <span className="font-bold text-primary">{myScore10}/10</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${myWidth}%` }}
            />
          </div>
        </div>

        {/* Média da categoria */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Média {categoryLabel}</span>
            <span className="text-muted-foreground">{avg10}/10</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-muted-foreground/40 rounded-full transition-all duration-700"
              style={{ width: `${avgWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mensagem de diferença */}
      <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
        isAbove
          ? "bg-green-500/10 text-green-700 dark:text-green-400"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      }`}>
        {isAbove ? (
          <TrendingUp className="h-4 w-4 flex-shrink-0" />
        ) : (
          <TrendingDown className="h-4 w-4 flex-shrink-0" />
        )}
        {isAbove ? (
          <span>
            <strong>+{diff10} pontos acima</strong> da média —{" "}
            seu projeto está entre os melhores de {categoryLabel}!
          </span>
        ) : (
          <span>
            <strong>{diff10} pontos abaixo</strong> da média —{" "}
            complete mais etapas para superar a média de {categoryLabel}.
          </span>
        )}
      </div>
    </div>
  );
}
