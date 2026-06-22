// components/project-card.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Star, Sprout, Eye, Compass, Hammer, Crown, Users } from "lucide-react";
import categories from "@/lib/data/categories.json";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ProjectAvatar } from "@/components/project-hero-banner";
import { ProjectCardLink } from "@/components/project-card-link";
import { ProjectCardMenu } from "@/components/project-card-menu";
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
  const router = useRouter();
  const owned = !role; // o overflow menu (Spec 026) só aparece nos projetos próprios
  const tasks = Array.isArray(p.tasks) ? p.tasks : [];
  // Etapas de validação concluídas = tasks etapa1..etapa5 com status 'evaluated'.
  // EXCLUI a task 'resumo_financeiro' (spec 022) — ela não é uma etapa do roadmap.
  // Conta PHASES distintas (Set) — duplicatas de tasks etapaN no banco
  // (auto-save concorrente, Spec 024) não devem inflar o progresso ("7/6").
  const etapasFase2Concluidas = new Set(
    tasks
      .filter((t) => t.status === "evaluated" && (t.phase ?? "").startsWith("etapa"))
      .map((t) => t.phase),
  ).size;

  // O roadmap mostra 6 etapas: a Fase 1 (criação do projeto) conta como a 1ª etapa
  // (sempre concluída, pois o projeto já existe) + as 5 etapas da Fase 2.
  const TOTAL_ETAPAS = 6;
  const completedTasks = 1 + etapasFase2Concluidas; // 1 = Fase 1 (create)

  const projectName =
    p.name && p.name.trim() && !p.name.startsWith("NovoProjeto")
      ? p.name
      : `Startup${p.id.substring(0, 6)}`;

  // ── Renomear inline (Spec 026) ──────────────────────────────────────────────
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(projectName);
  const [displayName, setDisplayName] = useState(projectName);
  const [savingName, setSavingName] = useState(false);
  const savedNameRef = useRef(projectName);

  const startRename = () => {
    setNameDraft(displayName);
    setIsRenaming(true);
  };

  const cancelRename = () => {
    setNameDraft(displayName);
    setIsRenaming(false);
  };

  const saveRename = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      cancelRename();
      return;
    }
    if (trimmed === savedNameRef.current) {
      setIsRenaming(false);
      return;
    }
    setSavingName(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("projects")
        .update({ name: trimmed })
        .eq("id", p.id);
      if (error) throw new Error(error.message);
      savedNameRef.current = trimmed;
      setDisplayName(trimmed);
      setIsRenaming(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao renomear.");
    } finally {
      setSavingName(false);
    }
  };

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
          <div className={`flex items-center gap-3 ${role ? "pr-24" : "pr-10"}`}>
            <ProjectAvatar projectName={displayName} category={p.category ?? undefined} size={48} />
            {isRenaming ? (
              <input
                autoFocus
                value={nameDraft}
                disabled={savingName}
                onChange={(e) => setNameDraft(e.target.value)}
                onFocus={(e) => e.currentTarget.select()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void saveRename();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    cancelRename();
                  }
                }}
                onBlur={() => void saveRename()}
                className="flex-1 min-w-0 rounded-md border border-primary/40 bg-background px-2 py-1 text-base font-semibold outline-none focus:border-primary"
                maxLength={100}
              />
            ) : (
              <h3 className="font-semibold text-base leading-snug line-clamp-2 flex-1 min-w-0 break-words">{displayName}</h3>
            )}
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

      {/* Overflow menu (Spec 026) — só nos projetos próprios. Fica FORA do <a>
          do card (irmão do link), posicionado no canto superior direito. */}
      {owned && (
        <div className="absolute top-3 right-3 z-20">
          <ProjectCardMenu
            projectId={p.id}
            projectName={displayName}
            tasks={tasks}
            onRenameRequest={startRename}
          />
        </div>
      )}

      {p.description && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 pointer-events-none opacity-0 transition-opacity duration-200 delay-700 group-hover/proj:opacity-100 bg-popover border rounded-xl p-4 shadow-xl">
          <p className="text-xs font-semibold text-foreground mb-1">Resumo</p>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{p.description}</p>
        </div>
      )}
    </div>
  );
}
