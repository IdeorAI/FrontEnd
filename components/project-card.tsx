// components/project-card.tsx
"use client";

import { TrendingUp, Star, Sprout, Eye, Compass, Hammer, Crown, Users } from "lucide-react";
import categories from "@/lib/data/categories.json";
import { ProjectAvatar } from "@/components/project-hero-banner";
import { ProjectCardLink } from "@/components/project-card-link";
import { RoadmapBar } from "@/components/roadmap-bar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Task = { status?: string; content?: string | null; phase?: string | null };

export type ProjectCardData = {
  id: string;
  name?: string;
  description?: string | null;
  category?: string | null;
  score?: number | null;
  ivo_index?: number | null;
  tasks?: Task[] | null;
};

type Tier = {
  nome: string;
  Icon: typeof Sprout;
};

function getTier(tasksCount: number): Tier {
  if (tasksCount === 0) return { nome: "Iniciante", Icon: Sprout };
  if (tasksCount < 3) return { nome: "Visionário", Icon: Eye };
  if (tasksCount < 5) return { nome: "Explorador", Icon: Compass };
  if (tasksCount < 7) return { nome: "Construtor", Icon: Hammer };
  return { nome: "Escalador", Icon: Crown };
}

interface ProjectCardProps {
  project: ProjectCardData;
  role?: "editor" | "viewer";
}

export function ProjectCard({ project: p, role }: ProjectCardProps) {
  const tasks = Array.isArray(p.tasks) ? p.tasks : [];
  // Etapas de validação concluídas = tasks etapa1..etapa5 com status 'evaluated'.
  // EXCLUI a task 'resumo_financeiro' (spec 022) — ela não é uma etapa do roadmap.
  const etapasFase2Concluidas = tasks.filter(
    (t) => t.status === "evaluated" && (t.phase ?? "").startsWith("etapa"),
  ).length;

  // O roadmap mostra 6 etapas: a Fase 1 (criação do projeto) conta como a 1ª etapa
  // (sempre concluída, pois o projeto já existe) + as 5 etapas da Fase 2.
  const TOTAL_ETAPAS = 6;
  const completedTasks = 1 + etapasFase2Concluidas; // 1 = Fase 1 (create)

  const projectName =
    p.name && p.name.trim() && !p.name.startsWith("NovoProjeto")
      ? p.name
      : `Startup${p.id.substring(0, 6)}`;

  const tier = getTier(etapasFase2Concluidas);
  const scoreValue = Number(p.score ?? 0) / 10;
  const highScore = scoreValue >= 9;
  const isComplete = etapasFase2Concluidas >= 5; // todas as 5 etapas da Fase 2 prontas

  const accentClass = isComplete ? "bg-emerald-500/60" : "bg-primary/60";

  return (
    <div className="relative group/proj">
      <ProjectCardLink projectId={p.id}>
        <article className="bg-card border rounded-xl p-5 flex flex-col gap-4 relative hover:border-foreground/20 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden">
          <div className={`absolute bottom-0 left-0 right-0 h-px ${accentClass}`} />

          {role && (
            <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border">
              <Users className="h-2.5 w-2.5" />
              {role === "editor" ? "Editor" : "Visualizador"}
            </div>
          )}

          {/* TOP: avatar + nome */}
          <div className={`flex items-center gap-3 ${role ? "pr-24" : ""}`}>
            <ProjectAvatar projectName={projectName} category={p.category ?? undefined} size={48} />
            <h3 className="font-semibold text-base leading-snug line-clamp-2 flex-1 min-w-0 break-words">{projectName}</h3>
          </div>

          {/* MEIO: categoria + IVO */}
          <div className="flex items-center justify-between gap-2">
            {p.category ? (
              <span className="inline-block text-xs text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                {(categories.find((c) => c.value === p.category) || { label: p.category }).label}
              </span>
            ) : (
              <span />
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 bg-primary/15 border border-primary/25 rounded-lg px-2.5 py-1.5 shrink-0">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-bold text-primary leading-tight">
                    {Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: "compact",
                      maximumFractionDigits: 0,
                    }).format(Number(p.ivo_index ?? 0))}
                  </span>
                  <span className="text-[10px] text-primary/60">IVO</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>IVO Index</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Score + Tier */}
          <div className="flex items-center gap-2 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                    highScore
                      ? "bg-yellow-500/10 border-transparent"
                      : "bg-transparent border-border"
                  }`}
                >
                  <Star
                    className={`h-3 w-3 ${
                      highScore ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      highScore ? "text-yellow-600 dark:text-yellow-400" : "text-foreground"
                    }`}
                  >
                    {scoreValue.toFixed(1)}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Score IdeorAI: {scoreValue.toFixed(1)} / 10</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border">
                  <tier.Icon className="h-3 w-3 text-foreground" />
                  <span className="text-xs font-semibold text-foreground">{tier.nome}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Badge de Progresso</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <RoadmapBar completed={completedTasks} total={TOTAL_ETAPAS} />
        </article>
      </ProjectCardLink>

      {p.description && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 pointer-events-none opacity-0 transition-opacity duration-200 delay-700 group-hover/proj:opacity-100 bg-popover border rounded-xl p-4 shadow-xl">
          <p className="text-xs font-semibold text-foreground mb-1">Resumo</p>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{p.description}</p>
        </div>
      )}
    </div>
  );
}
