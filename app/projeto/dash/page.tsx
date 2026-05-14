"use client";

import { FEATURES } from "@/lib/feature-flags";
import { createClient } from "@/lib/supabase/client";
import { TeamAvatars } from "@/components/team-avatars";
import { CardDialog } from "@/components/card-dialog";
import { AIStageCard } from "@/components/ai-stage-card";
import { calculateStageStatus, StageStatus, getStageSummaries } from "@/lib/api/stage-summaries";
import { log } from "@/lib/logger";
import categories from "@/lib/data/categories.json";
import {
  ListChecks,
  TrendingUp,
  Lightbulb,
  Search,
  Target,
  Briefcase,
  Rocket,
  Users,
  Download,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useReducer, useCallback, Suspense } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStageOperations } from "@/hooks/use-stage-operations";
import { BenchmarkPanel } from "@/components/projeto/benchmark-panel";
import { AnunciarModal } from "@/components/marketplace/anunciar-modal";
import { GoPivotCard } from "@/app/projeto/[id]/components/go-pivot-gate";
import { ProjectHeroBanner } from "@/components/project-hero-banner";
import { JourneyStepper, DEFAULT_STAGES } from "@/components/projeto/journey-stepper";
import { StageDetailCard } from "@/components/projeto/stage-detail-card";
import { IvoCard } from "@/components/projeto/ivo-card";
import { ScoreCard } from "@/components/projeto/score-card";
import { KeywordsBlock } from "@/components/projeto/keywords-block";
import { MilestoneStrip, DEFAULT_MILESTONES } from "@/components/projeto/milestone-strip";
import { Folder, ShieldCheck, Flag, ChevronRight as ChevronRightLucide, Pencil, FileText, Rocket as RocketIcon, ChevronDown as ChevronDownIcon } from "lucide-react";
import dynamic from "next/dynamic";

const IvoMiniChart = dynamic(
  () => import("./ivo-chart").then((m) => ({ default: m.IvoMiniChart })),
  { ssr: false, loading: () => <div className="h-10 w-full bg-muted/30 rounded animate-pulse" /> }
);

const IvoFullChart = dynamic(
  () => import("./ivo-chart").then((m) => ({ default: m.IvoFullChart })),
  { ssr: false, loading: () => <div className="h-52 w-full bg-muted/30 rounded animate-pulse" /> }
);

// ─── Dash State Types & Reducer ───────────────────────────────────────────────

type DashUser = { id?: string; email?: string; user_metadata?: Record<string, unknown> } | null;

type DashProject = {
  name?: string;
  valuation?: number;
  description?: string;
  created_at?: string;
  score?: number;
  category?: string;
  ivo_index?: number;
  ivo_o?: number;
  ivo_m?: number;
  ivo_v?: number;
  ivo_e?: number;
  ivo_t?: number;
  ivo_d?: number;
  ivo_score_10?: number;
  keywords?: string[] | null;
} | null;

type IvoPoint = { date: string; value: number; label: string };

interface DashState {
  user: DashUser;
  project: DashProject;
  activeDialog: string | null;
  anunciarOpen: boolean;
  stageStatuses: StageStatus[];
  peerProjects: { score: number }[];
  projectKeywords: string[];
  stageSummaries: Partial<Record<string, string>>;
  railTab: 'ivo' | 'score';
  expandedCardId: string | null;
  ivoHistory: IvoPoint[];
}

const initialDashState: DashState = {
  user: null,
  project: null,
  activeDialog: null,
  anunciarOpen: false,
  stageStatuses: [],
  peerProjects: [],
  projectKeywords: [],
  stageSummaries: {},
  railTab: 'ivo',
  expandedCardId: null,
  ivoHistory: [],
};

type DashAction =
  | { type: 'SET_USER'; payload: DashUser }
  | { type: 'SET_PROJECT'; payload: DashProject }
  | { type: 'UPDATE_PROJECT'; payload: Partial<NonNullable<DashProject>> }
  | { type: 'SET_ACTIVE_DIALOG'; payload: string | null }
  | { type: 'SET_ANUNCIAR_OPEN'; payload: boolean }
  | { type: 'SET_STAGE_STATUSES'; payload: StageStatus[] }
  | { type: 'SET_PEER_PROJECTS'; payload: { score: number }[] }
  | { type: 'SET_PROJECT_KEYWORDS'; payload: string[] }
  | { type: 'SET_STAGE_SUMMARIES'; payload: Partial<Record<string, string>> }
  | { type: 'SET_RAIL_TAB'; payload: 'ivo' | 'score' }
  | { type: 'SET_EXPANDED_CARD_ID'; payload: string | null }
  | { type: 'SET_IVO_HISTORY'; payload: IvoPoint[] };

function dashReducer(state: DashState, action: DashAction): DashState {
  switch (action.type) {
    case 'SET_USER':           return { ...state, user: action.payload };
    case 'SET_PROJECT':        return { ...state, project: action.payload };
    case 'UPDATE_PROJECT':     return { ...state, project: state.project ? { ...state.project, ...action.payload } : state.project };
    case 'SET_ACTIVE_DIALOG':  return { ...state, activeDialog: action.payload };
    case 'SET_ANUNCIAR_OPEN':  return { ...state, anunciarOpen: action.payload };
    case 'SET_STAGE_STATUSES': return { ...state, stageStatuses: action.payload };
    case 'SET_PEER_PROJECTS':  return { ...state, peerProjects: action.payload };
    case 'SET_PROJECT_KEYWORDS': return { ...state, projectKeywords: action.payload };
    case 'SET_STAGE_SUMMARIES': return { ...state, stageSummaries: action.payload };
    case 'SET_RAIL_TAB':       return { ...state, railTab: action.payload };
    case 'SET_EXPANDED_CARD_ID': return { ...state, expandedCardId: action.payload };
    case 'SET_IVO_HISTORY':    return { ...state, ivoHistory: action.payload };
    default:                   return state;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

function DashPageContent() {
  const [state, dispatch] = useReducer(dashReducer, initialDashState);
  const {
    user,
    project,
    activeDialog,
    anunciarOpen,
    stageStatuses,
    peerProjects,
    projectKeywords,
    stageSummaries,
    railTab,
    expandedCardId,
    ivoHistory,
  } = state;

  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("project_id");

  const handleKeywordsChange = async (next: string[]) => {
    dispatch({ type: 'SET_PROJECT_KEYWORDS', payload: next });
    if (!projectId) return;
    const supabase = createClient();
    await supabase.from("projects").update({ keywords: next }).eq("id", projectId);
  };

  // Re-busca campos IVO do projeto após background task do backend completar
  const refreshIvoData = useCallback(async () => {
    if (!projectId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("projects")
      .select("ivo_index, ivo_o, ivo_m, ivo_v, ivo_e, ivo_t, ivo_d, ivo_score_10")
      .eq("id", projectId)
      .single();
    if (data) dispatch({ type: 'UPDATE_PROJECT', payload: data as unknown as Partial<NonNullable<DashProject>> });
  }, [projectId]);

  const {
    etapaContent,
    completedStages,
    setEtapaContent,
    setCompletedStages,
    setCurrentStage,
    generateStage,
    saveStage,
  } = useStageOperations({ projectId });

  // Verificar se todas etapas estão completas (exceto Início)
  const todasEtapasCompletas = completedStages.filter(s => s > 0).length >= 5;

  // Calcular status das etapas para badges
  useEffect(() => {
    const loadStageStatuses = async () => {
      if (!projectId || !user) return;
      
      try {
        // F-03: Buscar status real do backend ao invés de calcular client-side
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser?.id) {
          const summaries = await getStageSummaries(projectId, currentUser.id).catch(() => []);
          const completedFromSummaries = summaries.map((s: { stageNumber: number }) => s.stageNumber);
          const summaryMap: Partial<Record<string, string>> = {};
          for (const s of summaries) { summaryMap[`etapa${s.stageNumber}`] = s.summary; }
          dispatch({ type: 'SET_STAGE_SUMMARIES', payload: summaryMap });

          // Fallback: também verificar tasks diretamente (independe de NEXT_PUBLIC_API_URL)
          const { data: tasks } = await supabase
            .from('tasks')
            .select('phase, status')
            .eq('project_id', projectId)
            .eq('status', 'evaluated');

          const completedFromTasks = (tasks ?? [])
            .map((t: { phase: string }) => parseInt(t.phase.replace('etapa', '')))
            .filter((n: number) => !isNaN(n) && n > 0);

          const allCompleted = [...new Set([...completedFromSummaries, ...completedFromTasks])].sort((a, b) => a - b);
          setCompletedStages([0, ...allCompleted]); // 0 = Início

          // Calcular statuses baseado nos resumos reais
          const statuses = calculateStageStatus(allCompleted, completedFromSummaries);
          dispatch({ type: 'SET_STAGE_STATUSES', payload: statuses });
        }
      } catch (error) {
        console.error("[DashPage] Erro ao carregar status das etapas:", error);
      }
    };
    
    loadStageStatuses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user]);

  // Função para verificar se uma etapa está bloqueada (F-02)
  const isEtapaBloqueada = (etapaId: string): boolean => {
    // Etapa 1 sempre desbloqueada
    if (etapaId === 'etapa1') return false;

    // Para outras etapas, verificar se a anterior está completa
    const etapaNumero = parseInt(etapaId.replace('etapa', ''));
    if (isNaN(etapaNumero)) return false; // Cards não-etapa (roadmap, valuation, etc)

    // F-02: Usar status real das etapas ao invés de lógica hardcoded
    const previousStageStatus = stageStatuses.find(s => s.stageNumber === etapaNumero - 1);
    return !previousStageStatus || previousStageStatus.status === 'pending';
  };


  const handleDownloadPDF = async (phase?: string) => {
    if (!projectId || !user) {
      toast.error("Projeto ou usuário não encontrado");
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser?.id) {
        toast.error("Usuário não autenticado");
        return;
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const endpoint = phase
        ? `${API_BASE}/api/projects/${projectId}/documents/export/pdf/${phase}`
        : `${API_BASE}/api/projects/${projectId}/documents/export/pdf`;

      log.info(`Baixando PDF${phase ? ` da fase ${phase}` : ' completo'}...`);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'x-user-id': currentUser.id,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao gerar PDF (status:", response.status, "):", errorText);
        throw new Error(`Falha ao gerar PDF: ${response.status} - ${errorText}`);
      }

      log.info("PDF gerado com sucesso, baixando arquivo...");

      // Baixar o arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = phase
        ? `Relatorio_${phase}_${new Date().toISOString().split('T')[0]}.pdf`
        : `Relatorio_Projeto_${projectId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      toast.error(`Erro ao gerar PDF: ${error instanceof Error ? error.message : "Verifique se há documentos salvos."}`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      dispatch({ type: 'SET_USER', payload: currentUser });

      // Buscar dados do projeto se tiver project_id
      if (projectId) {
        const { data: projectData } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projectData) {
          dispatch({ type: 'SET_PROJECT', payload: projectData as unknown as DashProject });

          // Inicializar keywords — DB tem prioridade, fallback para label da categoria
          if (projectData.keywords && projectData.keywords.length > 0) {
            dispatch({ type: 'SET_PROJECT_KEYWORDS', payload: projectData.keywords });
          } else if (projectData.category) {
            const catLabel = (categories.find((c) => c.value === projectData.category) || { label: projectData.category }).label;
            dispatch({ type: 'SET_PROJECT_KEYWORDS', payload: [catLabel] });
          }

          // Benchmark: buscar projetos públicos da mesma categoria (não-bloqueante)
          if (projectData.category) {
            supabase
              .from("projects")
              .select("score")
              .eq("category", projectData.category)
              .eq("is_public", true)
              .gt("score", 0)
              .neq("id", projectId)
              .limit(50)
              .then(({ data: peers }) => {
                if (peers) dispatch({ type: 'SET_PEER_PROJECTS', payload: peers });
              });
          }
        }

        // Buscar conteúdo existente das etapas
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("phase, content, status")
          .eq("project_id", projectId)
          .in("phase", ["etapa1", "etapa2", "etapa3", "etapa4", "etapa5"]);

        if (tasksError) {
          console.error("Erro ao buscar tasks:", tasksError);
        } else if (tasksData) {
          const contentMap: Record<string, string> = {};
          const completed: number[] = [0]; // Início sempre completo

          tasksData.forEach((task: { phase: string; content: string | null; status?: string }) => {
            if (task.content) {
              contentMap[task.phase] = task.content;

              // Mapear fase para número (etapa2 -> 2, etapa3 -> 3, etc.)
              const etapaNum = parseInt(task.phase.replace('etapa', ''));
              if (!isNaN(etapaNum) && task.status === 'evaluated') {
                completed.push(etapaNum);
              }
            }
          });

          setEtapaContent(contentMap);
          setCompletedStages(completed);

          // Definir etapa atual como a próxima após a última completa (máx 5 etapas)
          const maxCompleted = Math.max(...completed);
          setCurrentStage(maxCompleted < 5 ? maxCompleted + 1 : 5);

          // Auto-recalcular score (A+B: 25% completion + 15% depth + 40% IVO + 20% marcos vindo do backend)
          const evaluatedTasks = tasksData.filter((t: { status?: string }) => t.status === 'evaluated');
          if (evaluatedTasks.length > 0) {
            const totalStages = 5;
            const completionPts = (Math.min(evaluatedTasks.length, totalStages) / totalStages) * 25;
            const contentTier = (len: number) => len >= 1500 ? 3 : len >= 500 ? 2 : len >= 100 ? 1 : 0;
            const avgTier = evaluatedTasks.reduce((sum: number, t: { content?: string | null }) => sum + contentTier(t.content?.length ?? 0), 0) / evaluatedTasks.length;
            const depthPts = (avgTier / 3) * 15;
            const ivoAvg = projectData ? ((projectData.ivo_o ?? 5) + (projectData.ivo_m ?? 5) + (projectData.ivo_v ?? 5) + (projectData.ivo_e ?? 5) + (projectData.ivo_t ?? 5)) / 5 : 5;
            const qualityPts = (ivoAvg / 10) * 40;
            const localScore = Math.round(completionPts + depthPts + qualityPts);
            const dbScore = Number(projectData?.score ?? 0);
            // Preserva score do DB se for maior (inclui contribuição dos marcos calculada no backend)
            const realScore = Math.min(Math.max(localScore, dbScore), 100);

            if (realScore !== dbScore) {
              dispatch({ type: 'UPDATE_PROJECT', payload: { score: realScore } });
              supabase.from("projects").update({ score: realScore }).eq("id", projectId).then(() => {});
            }
          }
        }

        // Buscar histórico IVO para o gráfico de evolução
        supabase
          .from("ivo_history")
          .select("recorded_at, ivo_index")
          .eq("project_id", projectId)
          .order("recorded_at", { ascending: true })
          .limit(30)
          .then(({ data: histData }) => {
            // Trajetória completa: baseline (criação) → snapshots históricos → valor atual
            const BASELINE_IVO = 100; // ivo_index default na criação do projeto (ProjectModel.IvoIndex = 100)
            type Point = { date: string; label: string; value: number };
            const points: Point[] = [];

            // 1. Sempre começar com o baseline na data de criação
            if (projectData?.created_at) {
              const d = new Date(projectData.created_at);
              points.push({
                date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
                label: `Início — ${d.toLocaleDateString("pt-BR")}`,
                value: BASELINE_IVO,
              });
            }

            // 2. Adicionar todos os snapshots históricos
            ((histData ?? []).filter(r => r.recorded_at !== null && r.ivo_index !== null) as { recorded_at: string; ivo_index: number }[]).forEach((row) => {
              const d = new Date(row.recorded_at);
              points.push({
                date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
                label: d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
                value: Math.round(row.ivo_index),
              });
            });

            // 3. Sempre encerrar com o valor atual ("Agora") se diferente do último ponto
            if (projectData?.ivo_index) {
              const currentValue = Math.round(projectData.ivo_index);
              const last = points[points.length - 1];
              if (!last || last.value !== currentValue) {
                const now = new Date();
                points.push({
                  date: now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
                  label: "Agora",
                  value: currentValue,
                });
              }
            }

            if (points.length >= 2) dispatch({ type: 'SET_IVO_HISTORY', payload: points });
          });
      }
    };

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, router]);

  useEffect(() => {
    // Listen for custom event from sidebar
    const handleOpenCard = (event: Event) => {
      const customEvent = event as CustomEvent<{ cardId: string }>;
      dispatch({ type: 'SET_ACTIVE_DIALOG', payload: customEvent.detail.cardId });
    };

    window.addEventListener("openCard", handleOpenCard);

    return () => {
      window.removeEventListener("openCard", handleOpenCard);
    };
  }, []);

  if (!user) return null;

  // Definição dos cards
  const cards = [
    {
      id: "roadmap",
      icon: ListChecks,
      title: "Roadmap",
      description: "Acompanhe o progresso das 5 etapas do projeto",
      dialogTitle: "Roadmap - Etapas do Projeto",
      dialogContent: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Acompanhe o progresso de cada etapa do desenvolvimento da sua startup:
          </p>
          <div className="space-y-3">
            {[
              { num: 1, title: "Problema e Oportunidade", phase: "etapa1" },
              { num: 2, title: "Pesquisa de Mercado", phase: "etapa2" },
              { num: 3, title: "Proposta de Valor", phase: "etapa3" },
              { num: 4, title: "Modelo de Negócio", phase: "etapa4" },
              { num: 5, title: "MVP", phase: "etapa5" },
            ].map((etapa) => {
              const isCompleted = !!etapaContent[etapa.phase];
              return (
                <div
                  key={etapa.num}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${
                    isCompleted
                      ? "bg-green-100 dark:bg-green-900/20 border-green-500 dark:border-green-600"
                      : "bg-card"
                  }`}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      style={{ accentColor: '#16a34a' }}
                      checked={isCompleted}
                      disabled
                    />
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold ${isCompleted ? "text-green-900 dark:text-green-100" : "font-medium"}`}>
                      Etapa {etapa.num}
                    </div>
                    <div className={`text-sm ${isCompleted ? "text-green-800 dark:text-green-200" : "text-muted-foreground"}`}>
                      {etapa.title}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                    }`}
                  >
                    {isCompleted ? "Concluída ✓" : "Pendente"}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso Total:</span>
              <span className="font-bold text-primary">
                {Object.keys(etapaContent).filter(key => key.startsWith('etapa')).length} / 5 etapas
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "ivo-evolution",
      icon: TrendingUp,
      title: "IVO Index",
      description: "Evolução do valor do seu projeto",
      preview: project ? (
        <div className="mt-2 space-y-1">
          <div className="text-xl font-bold text-primary">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0,
            }).format(Number(project.ivo_index ?? project.valuation ?? 100))}
          </div>
          <IvoMiniChart data={ivoHistory} />
        </div>
      ) : null,
      dialogTitle: "Evolução do IVO Index",
      dialogContent: (
        <div className="space-y-5">
          {/* Header com valor atual */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary/15 via-primary/8 to-transparent border border-primary/20">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">IVO Index Atual</div>
                <div className="text-4xl font-bold text-primary">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0,
                  }).format(Number(project?.ivo_index ?? project?.valuation ?? 100))}
                </div>
              </div>
              {ivoHistory.length >= 2 && (() => {
                const first = ivoHistory[0].value;
                const last = ivoHistory[ivoHistory.length - 1].value;
                const pct = first > 0 ? ((last - first) / first) * 100 : 0;
                return (
                  <div className={`text-right ${pct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    <div className="text-2xl font-bold">{pct >= 0 ? "+" : ""}{pct.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">desde o início</div>
                  </div>
                );
              })()}
            </div>
            {/* Breakdown variáveis */}
            {project && (
              <div className="mt-3 pt-3 border-t border-primary/10 grid grid-cols-6 gap-2 text-center">
                {[
                  { label: "O", val: project.ivo_o, tip: "Originalidade" },
                  { label: "M", val: project.ivo_m, tip: "Mercado" },
                  { label: "V", val: project.ivo_v, tip: "Validação" },
                  { label: "E", val: project.ivo_e, tip: "Execução" },
                  { label: "T", val: project.ivo_t, tip: "Timing" },
                  { label: "D", val: project.ivo_d, tip: "Documentação" },
                ].map(({ label, val, tip }) => (
                  <div key={label} title={tip}>
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                    <div className="text-sm font-semibold text-foreground">{(val ?? 5).toFixed(1)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gráfico de evolução */}
          {ivoHistory.length > 1 ? (
            <div>
              <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Evolução ao longo do tempo
              </div>
              <IvoFullChart data={ivoHistory} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <TrendingUp className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Histórico ainda não disponível</p>
              <p className="text-xs mt-1">Complete etapas para ver a evolução do seu IVO Index aqui.</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            O IVO Index combina originalidade, potencial de mercado, validação da dor, execução, timing e qualidade de documentação.
            Complete mais etapas para refinar o índice.
          </p>
        </div>
      ),
    },
    {
      id: "etapa1",
      icon: Lightbulb,
      title: "Problema e Oportunidade",
      description: "Identifique o problema e a oportunidade de mercado",
      dialogTitle: "Etapa 1: Problema e Oportunidade",
      dialogContent: (
        <AIStageCard
          title="Problema e Oportunidade"
          description="Identifique o problema que sua solução resolve, as personas afetadas e a oportunidade de mercado existente."
          placeholder="Descreva o problema que você quer resolver. Ex: Pequenas empresas têm dificuldade em encontrar fornecedores confiáveis e comparar preços de forma eficiente..."
          onGenerate={(idea) => generateStage('etapa1', idea)}
          onSave={async (content) => { await saveStage('etapa1', content); setTimeout(refreshIvoData, 4000); }}
          existingContent={etapaContent['etapa1']}
          initialIdea={project?.description || ""}
          storageKey={projectId ? `${projectId}_etapa1` : undefined}
          nextStageId="etapa2"
          nextStageTitle="Pesquisa de Mercado"
          onGoToNextStage={() => {
            dispatch({ type: 'SET_ACTIVE_DIALOG', payload: null });
            setTimeout(() => dispatch({ type: 'SET_ACTIVE_DIALOG', payload: 'etapa2' }), 300);
          }}
        />
      ),
    },
    {
      id: "etapa2",
      icon: Search,
      title: "Pesquisa de Mercado",
      description: "Análise do mercado-alvo e concorrência",
      dialogTitle: "Etapa 2: Pesquisa de Mercado",
      dialogContent: (
        <AIStageCard
          title="Pesquisa de Mercado"
          description="Realize uma análise do mercado-alvo, incluindo TAM/SAM/SOM, principais players e oportunidades."
          placeholder="Descreva sua ideia de negócio. Ex: Plataforma SaaS para gestão de clínicas médicas..."
          onGenerate={(idea) => generateStage('etapa2', idea)}
          onSave={async (content) => { await saveStage('etapa2', content); setTimeout(refreshIvoData, 4000); }}
          existingContent={etapaContent['etapa2']}
          initialIdea={project?.description || ""}
          storageKey={projectId ? `${projectId}_etapa2` : undefined}
          nextStageId="etapa3"
          nextStageTitle="Proposta de Valor"
          onGoToNextStage={() => {
            dispatch({ type: 'SET_ACTIVE_DIALOG', payload: null });
            setTimeout(() => dispatch({ type: 'SET_ACTIVE_DIALOG', payload: 'etapa3' }), 300);
          }}
        />
      ),
    },
    {
      id: "etapa3",
      icon: Target,
      title: "Proposta de Valor",
      description: "Defina sua proposta única de valor",
      dialogTitle: "Etapa 3: Proposta de Valor",
      dialogContent: (
        <AIStageCard
          title="Proposta de Valor"
          description="Articule o valor único que sua solução oferece, os jobs-to-be-done e diferenciais vs alternativas."
          placeholder="Descreva sua ideia de negócio. Ex: App mobile para conectar freelancers a empresas..."
          onGenerate={(idea) => generateStage('etapa3', idea)}
          onSave={async (content) => { await saveStage('etapa3', content); setTimeout(refreshIvoData, 4000); }}
          existingContent={etapaContent['etapa3']}
          initialIdea={project?.description || ""}
          storageKey={projectId ? `${projectId}_etapa3` : undefined}
          nextStageId="etapa4"
          nextStageTitle="Modelo de Negócio"
          onGoToNextStage={() => {
            dispatch({ type: 'SET_ACTIVE_DIALOG', payload: null });
            setTimeout(() => dispatch({ type: 'SET_ACTIVE_DIALOG', payload: 'etapa4' }), 300);
          }}
        />
      ),
    },
    {
      id: "etapa4",
      icon: Briefcase,
      title: "Modelo de Negócio",
      description: "Estruture seu modelo de negócio",
      dialogTitle: "Etapa 4: Modelo de Negócio",
      dialogContent: (
        <AIStageCard
          title="Modelo de Negócio"
          description="Desenvolva seu Business Model Canvas com proposta de valor, segmentos, receitas e canais."
          placeholder="Descreva sua ideia de negócio. Ex: Marketplace B2B para fornecedores industriais..."
          onGenerate={(idea) => generateStage('etapa4', idea)}
          onSave={async (content) => { await saveStage('etapa4', content); setTimeout(refreshIvoData, 4000); }}
          existingContent={etapaContent['etapa4']}
          initialIdea={project?.description || ""}
          storageKey={projectId ? `${projectId}_etapa4` : undefined}
          nextStageId="etapa5"
          nextStageTitle="MVP"
          onGoToNextStage={() => {
            dispatch({ type: 'SET_ACTIVE_DIALOG', payload: null });
            setTimeout(() => dispatch({ type: 'SET_ACTIVE_DIALOG', payload: 'etapa5' }), 300);
          }}
        />
      ),
    },
    {
      id: "etapa5",
      icon: Rocket,
      title: "MVP",
      description: "Planeje seu Produto Mínimo Viável",
      dialogTitle: "Etapa 5: MVP - Produto Mínimo Viável",
      dialogContent: (
        <AIStageCard
          title="MVP - Produto Mínimo Viável"
          description="Defina as funcionalidades essenciais do seu MVP, o stack tecnológico e as métricas de sucesso iniciais."
          placeholder="Descreva sua ideia de negócio. Ex: App de delivery para pet shops, com rastreamento em tempo real e agendamento de coleta..."
          onGenerate={(idea) => generateStage('etapa5', idea)}
          onSave={async (content) => { await saveStage('etapa5', content); setTimeout(refreshIvoData, 4000); }}
          existingContent={etapaContent['etapa5']}
          initialIdea={project?.description || ""}
          storageKey={projectId ? `${projectId}_etapa5` : undefined}
        />
      ),
    },
    {
      id: "equipe",
      icon: Users,
      title: "Equipe",
      description: "Gerencie membros da equipe e colaboradores",
      dialogTitle: "Equipe do Projeto",
      dialogContent: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Gerencie os membros da sua equipe e defina papéis e responsabilidades.
          </p>
          <TeamAvatars />
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm">
              Funcionalidade completa de gerenciamento de equipe em desenvolvimento.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "relatorios",
      icon: FileText,
      title: "Relatórios",
      description: "Acesse relatórios detalhados e insights",
      dialogTitle: "Relatórios e Documentos",
      dialogContent: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Acesse todos os documentos e relatórios gerados para o seu projeto.
          </p>

          <div className="p-4 border rounded-lg bg-primary/5">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório Completo (PDF)
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Baixe um PDF consolidado com todos os documentos gerados nas etapas do projeto.
            </p>
            <button
              onClick={() => handleDownloadPDF()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Baixar Relatório Completo
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Relatórios por Etapa</h3>

            {[
              { id: 'etapa1', title: 'Problema e Oportunidade', hasContent: !!etapaContent['etapa1'] },
              { id: 'etapa2', title: 'Pesquisa de Mercado', hasContent: !!etapaContent['etapa2'] },
              { id: 'etapa3', title: 'Proposta de Valor', hasContent: !!etapaContent['etapa3'] },
              { id: 'etapa4', title: 'Modelo de Negócio', hasContent: !!etapaContent['etapa4'] },
              { id: 'etapa5', title: 'MVP', hasContent: !!etapaContent['etapa5'] },
            ].map((etapa) => (
              <div key={etapa.id} className="p-3 border rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{etapa.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {etapa.hasContent ? 'Documento gerado' : 'Aguardando geração'}
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadPDF(etapa.id)}
                  disabled={!etapa.hasContent}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                    etapa.hasContent
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  <Download className="h-3 w-3" />
                  Baixar PDF
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm">
              Novos relatórios estarão disponíveis à medida que você completa as etapas do
              projeto.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Hero Banner */}
        {project && (
          <ProjectHeroBanner
            projectName={project.name ?? "Projeto"}
            category={project.category}
            createdAt={project.created_at}
          />
        )}
        {/* Action Bar — breadcrumb + ações primárias + utilidades compactas */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-ink-tertiary" aria-label="Breadcrumb">
            <Folder className="h-3 w-3 text-ink-muted" strokeWidth={2} />
            <button
              onClick={() => router.push('/dashboard')}
              className="hover:text-ink-primary transition-colors"
            >
              Meus Projetos
            </button>
            <ChevronRightLucide className="h-3 w-3 text-ink-muted" strokeWidth={2} />
            <span className="text-ink-secondary truncate max-w-[260px]">{project?.name ?? 'Projeto'}</span>
            {todasEtapasCompletas && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                Concluído
              </span>
            )}
          </nav>

          {/* Cluster de ações */}
          <div className="flex items-center gap-2">
            {/* Exportar */}
            {todasEtapasCompletas && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card text-sm font-semibold text-ink-secondary hover:border-strong hover:text-ink-primary transition-colors"
                    title="Exportar relatório"
                  >
                    <Download className="h-4 w-4" strokeWidth={2} />
                    Exportar
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Gerar relatório consolidado</p></TooltipContent>
              </Tooltip>
            )}

            {/* GO or PIVOT — ação primária */}
            {completedStages.filter(s => s > 0).length >= 5 && (
              <a
                href="#go-pivot"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-brand text-brand-foreground text-sm font-semibold shadow-sm hover:bg-brand-hover transition-colors"
              >
                <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                GO or PIVOT
              </a>
            )}

            {/* Publicar no Marketplace — oculto até NEXT_PUBLIC_ENABLE_MARKETPLACE=true */}
            {FEATURES.MARKETPLACE && completedStages.filter(s => s > 0).length >= 1 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => dispatch({ type: 'SET_ANUNCIAR_OPEN', payload: true })}
                    className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-brand-subtle text-ink-brand text-sm font-semibold hover:bg-brand-muted transition-colors"
                  >
                    <Rocket className="h-4 w-4" strokeWidth={2} />
                    Publicar
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Publicar no Marketplace</p></TooltipContent>
              </Tooltip>
            )}

          </div>
        </div>

      {/* ─── Journey Stepper (HERO da jornada) ─────────────────── */}
      {(() => {
        // currentIndex: primeira etapa não-concluída (0..5)
        const completedAdj = completedStages.filter(s => s >= 0);
        const lastDone = completedAdj.length > 0 ? Math.max(...completedAdj) : -1;
        const currentIdx = Math.min(DEFAULT_STAGES.length - 1, lastDone + 1);
        const completedSet = Array.from(new Set(completedAdj)); // 0 = Início
        return (
          <JourneyStepper
            currentIndex={currentIdx}
            completed={completedSet}
            stageSummaries={stageSummaries}
            onStageNavigate={(stage) => {
              const num = parseInt(stage.id.replace('etapa', ''), 10);
              if (!isNaN(num) && projectId) {
                router.push(`/projeto/${projectId}/fase2/etapa${num}`);
              }
            }}
          />
        );
      })()}

      {/* ─── Grid 2 colunas: etapas (esq) · right rail (dir) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Esquerda: Stage Detail Cards */}
        <div className="flex flex-col gap-3">
          <div className="px-1 pt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">
            Etapas da jornada
          </div>

          {/* Início (etapa0) — sempre concluída */}
          <StageDetailCard
            short="01"
            label="Início"
            description="Projeto iniciado — pronto para a jornada de validação."
            icon={Flag}
            status="completed"
          />

          {/* Etapas 1-5 */}
          {(() => {
            const stageDefs: { id: string; short: string; label: string; description: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
              { id: 'etapa1', short: '02', label: 'Problema e Oportunidade', description: 'Identifique o problema, persona e oportunidade de mercado.', icon: Lightbulb },
              { id: 'etapa2', short: '03', label: 'Pesquisa de Mercado',     description: 'Análise do mercado-alvo, concorrentes e tendências.', icon: Search },
              { id: 'etapa3', short: '04', label: 'Proposta de Valor',       description: 'O que torna sua solução única e desejável.', icon: Target },
              { id: 'etapa4', short: '05', label: 'Modelo de Negócio',       description: 'Como sua startup gera receita e captura valor.', icon: Briefcase },
              { id: 'etapa5', short: '06', label: 'MVP',                     description: 'Produto mínimo viável para validar com usuários reais.', icon: Rocket },
            ];
            return stageDefs.map((s) => {
              const num = parseInt(s.id.replace('etapa', ''), 10);
              const isCompleted = completedStages.includes(num);
              const isLocked = isEtapaBloqueada(s.id);
              const status = isCompleted ? 'completed' : isLocked ? 'locked' : 'in-progress';
              const isExpanded = expandedCardId === s.id;
              const summary = stageSummaries[s.id];
              return (
                <div key={s.id}>
                  <StageDetailCard
                    short={s.short}
                    label={s.label}
                    description={s.description}
                    icon={s.icon}
                    status={status}
                    onClick={isLocked ? undefined : () => dispatch({ type: 'SET_EXPANDED_CARD_ID', payload: expandedCardId === s.id ? null : s.id })}
                  />
                  {isExpanded && (
                    <div className="mt-1 rounded-xl border border-brand/30 bg-brand-subtle/40 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-ink-primary">{s.label}</span>
                        <button onClick={() => dispatch({ type: 'SET_EXPANDED_CARD_ID', payload: null })} className="text-ink-muted hover:text-ink-primary">
                          <ChevronDownIcon className="h-4 w-4 rotate-180" strokeWidth={2} />
                        </button>
                      </div>
                      {summary ? (
                        <>
                          <p className="text-xs leading-relaxed text-ink-secondary line-clamp-4">{summary}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={() => projectId && router.push(`/projeto/${projectId}/fase2/etapa${num}`)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-ink-primary hover:border-strong"
                            >
                              <Pencil className="h-3 w-3" strokeWidth={2} />
                              Editar
                            </button>
                            <button
                              onClick={() => {/* spec 014 */}}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-ink-brand hover:bg-brand/20"
                            >
                              <FileText className="h-3 w-3" strokeWidth={2} />
                              Gerar Relatório
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-xs leading-relaxed text-ink-tertiary">
                            Esta etapa ainda não foi realizada. Clique em &quot;Desenvolver&quot; para iniciar com o apoio da IA.
                          </p>
                          <div className="mt-3">
                            <button
                              onClick={() => projectId && router.push(`/projeto/${projectId}/fase2/etapa${num}`)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-bold text-brand-foreground hover:bg-brand-hover"
                            >
                              <RocketIcon className="h-3 w-3" strokeWidth={2} />
                              Desenvolver Etapa
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>

        {/* Direita: Right rail */}
        <div className="flex flex-col gap-3">
          {/* IVO + Score tabs */}
          {project && (
            <div>
              <div className="mb-2 flex rounded-lg border border-border bg-card p-0.5">
                {(['ivo', 'score'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => dispatch({ type: 'SET_RAIL_TAB', payload: tab })}
                    className={cn(
                      "flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors",
                      railTab === tab
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-ink-muted hover:text-ink-primary",
                    )}
                  >
                    {tab === 'ivo' ? 'IVO Index' : 'Score'}
                  </button>
                ))}
              </div>
              {railTab === 'ivo' ? (
                <IvoCard
                  value={Number(project.ivo_index ?? project.valuation ?? 100)}
                  prevValue={ivoHistory.length >= 2 ? ivoHistory[ivoHistory.length - 2].value : undefined}
                  history={ivoHistory}
                  partial={(!project.ivo_o || project.ivo_o === 5) && (!project.ivo_m || project.ivo_m === 5)}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_DIALOG', payload: 'ivo-evolution' })}
                />
              ) : (
                <ScoreCard
                  score={Number(project.score ?? 0)}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_DIALOG', payload: 'benchmark' })}
                />
              )}
            </div>
          )}

          {/* GO or PIVOT */}
          <div id="go-pivot">
            {projectId && user?.id && (
              <GoPivotCard
                projectId={projectId}
                userId={user.id}
                etapa2Complete={completedStages.includes(2)}
              />
            )}
          </div>

          {/* Keywords */}
          <KeywordsBlock
            keywords={projectKeywords}
            onKeywordsChange={handleKeywordsChange}
          />

          {/* Equipe */}
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_DIALOG', payload: 'equipe' })}
            className="rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-strong hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-ink-brand" strokeWidth={2} />
                <span className="text-[13px] font-bold text-ink-primary">Equipe</span>
              </div>
              <ChevronRightLucide className="h-3.5 w-3.5 text-ink-muted" strokeWidth={2} />
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-tertiary">
              Convide co-fundadores e colaboradores para o projeto.
            </p>
          </button>
        </div>
      </div>

      {/* ─── Milestone Strip ──────────────────────────────────── */}
      {(() => {
        const completedCount = completedStages.filter(s => s > 0).length;
        // Mapeia conclusão de etapas para marcos correspondentes
        const milestones = DEFAULT_MILESTONES.map((m, idx) => ({
          ...m,
          unlocked: idx < completedCount + 1, // primeira ideia unlocked desde criação
        }));
        return <MilestoneStrip milestones={milestones} />;
      })()}

      {project?.category && project?.score !== undefined && (
        <BenchmarkPanel
          projectScore={Number(project.score)}
          projectCategory={project.category}
          peerProjects={peerProjects}
        />
      )}

      {/* Modais */}
      {cards.map((card) => (
        <CardDialog
          key={`dialog-${card.id}`}
          title={card.dialogTitle}
          content={card.dialogContent}
          isOpen={activeDialog === card.id}
          onClose={() => dispatch({ type: 'SET_ACTIVE_DIALOG', payload: null })}
        />
      ))}

      {/* Modal de anunciar no Marketplace */}
      <AnunciarModal
        open={anunciarOpen}
        onClose={() => dispatch({ type: 'SET_ANUNCIAR_OPEN', payload: false })}
      />
      </div>
    </TooltipProvider>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <DashPageContent />
    </Suspense>
  );
}
