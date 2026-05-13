// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

// Marcar como dinâmico para Next.js 15+
export const dynamic = 'force-dynamic';

import { DashboardFilters } from "@/components/dashboard-filters";
import { updateProjectScore } from './actions';
import categories from "@/lib/data/categories.json";
import { RoadmapBar } from "@/components/roadmap-bar";
import { ProjectCardLink } from "@/components/project-card-link";
import { CreateProjectButton } from "@/components/create-project-button";
import { TrendingUp, Star, Award, Users } from "lucide-react";
import { ProjectAvatar } from "@/components/project-hero-banner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    cat?: string;
    score?: string; // 3 | 5 | 7 | 9
    val?: string; // lte_1k | gt_1k | gt_5k | ...
    status?: string; // dev | done
    sort?: string; // created_asc, created_desc, updated_desc, score_desc, valuation_desc, name_asc
  }>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // ----- montar query dinamicamente -----
  let query = supabase
    .from("projects")
    .select(
      "id, name, description, score, valuation, ivo_index, ivo_o, ivo_m, ivo_v, ivo_e, ivo_t, ivo_d, updated_at, created_at, category, current_phase, tasks(id, phase, status, content)"
    )
    .eq("owner_id", user.id);

  // busca (name/description)
  if (searchParams?.q && searchParams.q.trim()) {
    const q = `%${searchParams.q.trim()}%`;
    query = query.or(`name.ilike.${q},description.ilike.${q}`);
  }

  // categoria
  if (searchParams?.cat) {
    query = query.eq("category", searchParams.cat);
  }

  // score mínimo
  if (searchParams?.score) {
    const min = Number(searchParams.score);
    if (!Number.isNaN(min)) query = query.gte("score", min);
  }

  // valuation buckets
  const val = searchParams?.val;
  const mapVal: Record<string, { op: "lte" | "gt"; value: number }> = {
    lte_1k: { op: "lte", value: 1_000 },
    gt_1k: { op: "gt", value: 1_000 },
    gt_5k: { op: "gt", value: 5_000 },
    gt_10k: { op: "gt", value: 10_000 },
    gt_25k: { op: "gt", value: 25_000 },
    gt_50k: { op: "gt", value: 50_000 },
    gt_100k: { op: "gt", value: 100_000 },
    gt_500k: { op: "gt", value: 500_000 },
    gt_1m: { op: "gt", value: 1_000_000 },
  };
  if (val && mapVal[val]) {
    const { op, value } = mapVal[val];
    query =
      op === "lte"
        ? query.lte("valuation", value)
        : query.gt("valuation", value);
  }

  // status → mapeei "Concluído" como current_phase = 'concluido'
  // se você preferir outra coluna/valor, só trocar abaixo.
  if (searchParams?.status === "done") {
    query = query.eq("current_phase", "concluido");
  } else if (searchParams?.status === "dev") {
    query = query.neq("current_phase", "concluido");
  }

  // ordenação
  const sort =
    (searchParams?.sort as
      | "created_asc"
      | "created_desc"
      | "updated_desc"
      | "score_desc"
      | "valuation_desc"
      | "name_asc") || "updated_desc";

  switch (sort) {
    case "created_asc":
      query = query.order("created_at", { ascending: true });
      break;
    case "created_desc":
      query = query.order("created_at", { ascending: false });
      break;
    case "updated_desc":
      query = query.order("updated_at", { ascending: false });
      break;
    case "score_desc":
      query = query.order("score", { ascending: false });
      break;
    case "valuation_desc":
      query = query.order("valuation", { ascending: false });
      break;
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
  }

  const { data: projects, error: loadErr } = await query;
  if (loadErr) console.error(loadErr);

  // Score local — preview rápido do score; backend recalcula com marcos (Opção B).
  // Estrutura: 25% conclusão + 15% profundidade + 40% IVO + (até 20% marcos vem do backend).
  // Aqui usamos peso balanceado de IVO (sem categoria) só como aproximação visual.
  function computeScore(
    tasks: { status?: string; content?: string | null }[],
    p: { ivo_o?: number; ivo_m?: number; ivo_v?: number; ivo_e?: number; ivo_t?: number },
    dbScore?: number,
  ): number {
    const evaluated = tasks.filter(t => t.status === "evaluated");
    const completionPts = (Math.min(evaluated.length, 5) / 5) * 25;
    const tier = (len: number) => (len >= 1500 ? 3 : len >= 500 ? 2 : len >= 100 ? 1 : 0);
    const depthPts = evaluated.length === 0
      ? 0
      : (evaluated.reduce((s, t) => s + tier(t.content?.length ?? 0), 0) / evaluated.length / 3) * 15;
    const ivoAvg = ((p.ivo_o ?? 5) + (p.ivo_m ?? 5) + (p.ivo_v ?? 5) + (p.ivo_e ?? 5) + (p.ivo_t ?? 5)) / 5;
    const qualityPts = (ivoAvg / 10) * 40;
    const localScore = Math.round(completionPts + depthPts + qualityPts);

    // Se o DB tem score maior (provavelmente com marcos), preserva
    return Math.min(Math.max(localScore, Number(dbScore ?? 0)), 100);
  }

  const projectsList = projects ?? [];
  for (const p of projectsList) {
    const tasks = Array.isArray(p.tasks) ? p.tasks : [];
    const realScore = computeScore(tasks, p as { ivo_o?: number; ivo_m?: number; ivo_v?: number; ivo_e?: number; ivo_t?: number }, Number(p.score ?? 0));
    if (realScore !== Number(p.score ?? 0)) {
      updateProjectScore(p.id, realScore).catch(() => {});
      p.score = realScore;
    }
  }

  // Re-ordenar client-side após recálculo de scores (o DB pode ter valores stale)
  if (sort === "score_desc") {
    projectsList.sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0));
  }

  // ── Projetos compartilhados comigo ────────────────────────────────────────
  const { data: rawMemberships } = await supabase
    .from("project_members")
    .select(`role, project:project_id (id, name, description, score, valuation, ivo_index, updated_at, created_at, category, current_phase, tasks(id, phase, status, content))`)
    .eq("user_id", user.id)
    .eq("status", "accepted");

  type SharedEntry = {
    role: string;
    project: {
      id: string; name: string; description?: string; score?: number;
      valuation?: number; ivo_index?: number; updated_at: string;
      created_at: string; category?: string; current_phase?: string;
      tasks?: { status?: string; content?: string | null }[];
    };
  };
  const sharedProjects: SharedEntry[] = ((rawMemberships ?? []) as unknown as { role: string; project: SharedEntry["project"] | null }[])
    .filter((m) => m.project != null)
    .map((m) => ({ role: m.role, project: m.project! }));

  // Função auxiliar para calcular medalha baseada no progresso
  const getMedalha = (tasksCount: number) => {
    if (tasksCount === 0) return { nome: "Iniciante", color: "text-gray-500" };
    if (tasksCount >= 1 && tasksCount < 3) return { nome: "Visionário", color: "text-blue-500" };
    if (tasksCount >= 3 && tasksCount < 5) return { nome: "Explorador", color: "text-purple-500" };
    if (tasksCount >= 5 && tasksCount < 7) return { nome: "Construtor", color: "text-orange-500" };
    if (tasksCount >= 7) return { nome: "Escalador", color: "text-green-500" };
    return { nome: "Iniciante", color: "text-gray-500" };
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho superior */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <LogoutButton />
          <CreateProjectButton />
        </div>
      </div>

      {/* HEADER de filtros/busca/ordenação */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-[#8c7dff]">Meus Projetos</h2>
        <DashboardFilters />
      </div>

      {/* Progress Checklist — desativado temporariamente (onboarding revisado) */}
      {/* {(projects?.length ?? 0) > 0 && (
        <ProgressChecklist etapasConcluidas={etapasConcluidas} />
      )} */}

      {/* Cards */}
      <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(projects ?? []).map((p) => {
          // Calcular etapas completas (tasks com status 'evaluated')
          const completedTasks = Array.isArray(p.tasks)
            ? p.tasks.filter((t: { status?: string }) => t.status === 'evaluated').length
            : 0;

          // Gerar nome padrão se não houver nome
          const projectName = p.name && p.name.trim() && !p.name.startsWith('NovoProjeto')
            ? p.name
            : `Startup${p.id.substring(0, 6)}`;

          // Calcular medalha
          const medalha = getMedalha(completedTasks);

          return (
            <div key={p.id} className="relative group/proj">
              <ProjectCardLink projectId={p.id}>
                <article className="bg-card border rounded-xl p-5 flex flex-col gap-4 relative hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden">
                  {/* Barra de acento inferior */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/60" />

                  {/* TOP: avatar retangular + nome */}
                  <div className="flex items-center gap-3">
                    <ProjectAvatar projectName={projectName} category={p.category} size={48} />
                    <h3 className="font-semibold text-base leading-snug line-clamp-2 flex-1">{projectName}</h3>
                  </div>

                  {/* MEIO: categoria + IVO */}
                  <div className="flex items-center justify-between gap-2">
                    {p.category ? (
                      <span className="inline-block text-xs text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                        {(categories.find((c) => c.value === p.category) || { label: p.category }).label}
                      </span>
                    ) : (
                      <span />
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 bg-primary/10 rounded-lg px-2.5 py-1.5 shrink-0">
                          <TrendingUp className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-bold text-primary leading-tight">
                            {Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(
                              Number((p as { ivo_index?: number }).ivo_index ?? 0)
                            )}
                          </span>
                          <span className="text-[10px] text-muted-foreground">IVO</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>IVO Index</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Score + Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 rounded-full">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                            {(Number(p.score) / 10).toFixed(1)}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Score IdeorAI: {(Number(p.score) / 10).toFixed(1)} / 10</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                          medalha.color === 'text-gray-500' ? 'bg-gray-500/10' :
                          medalha.color === 'text-blue-500' ? 'bg-blue-500/10' :
                          medalha.color === 'text-purple-500' ? 'bg-purple-500/10' :
                          medalha.color === 'text-orange-500' ? 'bg-orange-500/10' :
                          'bg-green-500/10'
                        }`}>
                          <Award className={`h-3 w-3 ${medalha.color}`} />
                          <span className={`text-xs font-semibold ${medalha.color}`}>{medalha.nome}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Badge de Progresso</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Barra de progresso */}
                  <RoadmapBar completed={completedTasks} total={5} />
                </article>
              </ProjectCardLink>

              {/* Hover: resumo do projeto após delay */}
              {p.description && (
                <div className="absolute left-0 right-0 top-full z-30 mt-1 pointer-events-none opacity-0 transition-opacity duration-200 delay-700 group-hover/proj:opacity-100 bg-popover border rounded-xl p-4 shadow-xl">
                  <p className="text-xs font-semibold text-foreground mb-1">Resumo</p>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{p.description}</p>
                </div>
              )}
            </div>
          );
        })}

        {projects?.length === 0 && (
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">Minhas Startups</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Nenhum projeto encontrado com os filtros atuais.
            </p>
            <CreateProjectButton />
          </div>
        )}
      </div>
      </TooltipProvider>

      {/* ── Compartilhados comigo ──────────────────────────────────────── */}
      {sharedProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#8c7dff]" />
            <h2 className="text-lg font-semibold text-[#8c7dff]">Compartilhados comigo</h2>
          </div>
          <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedProjects.map(({ role, project: p }) => {
              const completedTasks = Array.isArray(p.tasks)
                ? p.tasks.filter((t) => t.status === "evaluated").length
                : 0;
              const projectName =
                p.name && p.name.trim() && !p.name.startsWith("NovoProjeto")
                  ? p.name
                  : `Startup${p.id.substring(0, 6)}`;
              const medalha = getMedalha(completedTasks);
              const isEditor = role === "editor";

              return (
                <div key={p.id} className="relative group/proj">
                  <ProjectCardLink projectId={p.id}>
                    <article className="bg-card border rounded-xl p-5 flex flex-col gap-4 relative hover:shadow-md transition-shadow duration-200 cursor-pointer overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500/60" />

                      {/* Badge de role */}
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isEditor
                            ? "bg-blue-500/15 text-blue-500"
                            : "bg-gray-500/15 text-gray-400"
                        }`}>
                          {isEditor ? "Editor" : "Visualizador"}
                        </span>
                      </div>

                      {/* TOP: avatar retangular + nome */}
                      <div className="flex items-center gap-3 pr-20">
                        <ProjectAvatar projectName={projectName} category={p.category} size={48} />
                        <h3 className="font-semibold text-base leading-snug line-clamp-2 flex-1">{projectName}</h3>
                      </div>

                      {/* MEIO: categoria + IVO */}
                      <div className="flex items-center justify-between gap-2">
                        {p.category ? (
                          <span className="inline-block text-xs text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                            {(categories.find((c) => c.value === p.category) || { label: p.category }).label}
                          </span>
                        ) : (
                          <span />
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 bg-primary/10 rounded-lg px-2.5 py-1.5 shrink-0">
                              <TrendingUp className="h-3.5 w-3.5 text-primary" />
                              <span className="text-sm font-bold text-primary leading-tight">
                                {Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(
                                  Number(p.ivo_index ?? 0)
                                )}
                              </span>
                              <span className="text-[10px] text-muted-foreground">IVO</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent><p>IVO Index</p></TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Score + Badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 rounded-full">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                                {(Number(p.score) / 10).toFixed(1)}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent><p>Score IdeorAI: {(Number(p.score) / 10).toFixed(1)} / 10</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                              medalha.color === "text-gray-500" ? "bg-gray-500/10" :
                              medalha.color === "text-blue-500" ? "bg-blue-500/10" :
                              medalha.color === "text-purple-500" ? "bg-purple-500/10" :
                              medalha.color === "text-orange-500" ? "bg-orange-500/10" :
                              "bg-green-500/10"
                            }`}>
                              <Award className={`h-3 w-3 ${medalha.color}`} />
                              <span className={`text-xs font-semibold ${medalha.color}`}>{medalha.nome}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent><p>Badge de Progresso</p></TooltipContent>
                        </Tooltip>
                      </div>

                      <RoadmapBar completed={completedTasks} total={5} />
                    </article>
                  </ProjectCardLink>

                  {/* Hover: resumo do projeto após delay */}
                  {p.description && (
                    <div className="absolute left-0 right-0 top-full z-30 mt-1 pointer-events-none opacity-0 transition-opacity duration-200 delay-700 group-hover/proj:opacity-100 bg-popover border rounded-xl p-4 shadow-xl">
                      <p className="text-xs font-semibold text-foreground mb-1">Resumo</p>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{p.description}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </TooltipProvider>
        </div>
      )}

    </div>
  );
}
