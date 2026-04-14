"use client";

import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import { TeamAvatars } from "@/components/team-avatars";
import { CardDialog } from "@/components/card-dialog";
import { AIStageCard } from "@/components/ai-stage-card";
import { ProjectProgressLine } from "@/components/project-progress-line";
import { StageBadge } from "@/components/StageBadge";
import { calculateStageStatus, StageStatus, getStageSummaries } from "@/lib/api/stage-summaries";
import { log } from "@/lib/logger";
import Image from "next/image";
import {
  ListChecks,
  TrendingUp,
  Lightbulb,
  Search,
  Target,
  Briefcase,
  Rocket,
  Users,
  FileText,
  Download,
  Bell,
  Star,
  FileCheck2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { useStageOperations } from "@/hooks/use-stage-operations";
import { ProjectAnalyticsPanel } from "@/components/projeto/project-analytics-panel";
import { AnunciarModal } from "@/components/marketplace/anunciar-modal";

function DashPageContent() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, unknown> } | null>(null);
  const [project, setProject] = useState<{
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
  } | null>(null);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [anunciarOpen, setAnunciarOpen] = useState(false);
  const [stageStatuses, setStageStatuses] = useState<StageStatus[]>([]); // Status dos badges das etapas
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("project_id");

  const {
    etapaContent,
    completedStages,
    currentStage,
    setEtapaContent,
    setCompletedStages,
    setCurrentStage,
    generateStage,
    saveStage,
  } = useStageOperations({ projectId });

  // Calcular medalha baseada no progresso
  const getMedalha = () => {
    const completedCount = completedStages.filter(s => s > 0).length; // Excluir "Início"
    if (completedCount === 0) {
      return {
        nome: "Iniciante",
        badge: "/assets/badges/badge_visionário PENDENTE.png",
        color: "text-gray-500"
      };
    }
    if (completedCount >= 1 && completedCount < 3) {
      return {
        nome: "Visionário",
        badge: "/assets/badges/badge_visionario.png",
        color: "text-cyan-400"
      };
    }
    if (completedCount >= 3 && completedCount < 5) {
      return {
        nome: "Explorador",
        badge: "/assets/badges/badge_explorador.png",
        color: "text-rose-600"
      };
    }
    // Fase 2 completa (etapas 4-5)
    return {
      nome: "Explorador",
      badge: "/assets/badges/badge_explorador.png",
      color: "text-rose-600"
    };
  };

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
          const summaries = await getStageSummaries(projectId, currentUser.id);
          const completed = summaries.map(s => s.stageNumber);
          setCompletedStages([0, ...completed]); // 0 = Início
          
          // Calcular statuses baseado nos resumos reais
          const statuses = calculateStageStatus(completed, completed);
          setStageStatuses(statuses);
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

  // Obter nome da etapa anterior que precisa ser concluída
  const getEtapaAnteriorNome = (etapaId: string): string => {
    const etapaNumero = parseInt(etapaId.replace('etapa', ''));
    const nomesEtapas = [
      "Início",
      "Ideia e Problema",    // etapa1
      "Pesquisa de Mercado", // etapa2
      "Proposta de Valor",   // etapa3
      "Modelo de Negócio",   // etapa4
      "Definição do MVP",    // etapa5
    ];
    return nomesEtapas[etapaNumero - 1] || "Etapa anterior";
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

      setUser(currentUser);

      // Buscar dados do projeto se tiver project_id
      if (projectId) {
        const { data: projectData } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projectData) {
          setProject(projectData);
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

          // Auto-recalcular score a partir das tasks locais
          const evaluatedTasks = tasksData.filter((t: { status?: string }) => t.status === 'evaluated');
          if (evaluatedTasks.length > 0) {
            let pts = evaluatedTasks.length * 15;
            pts += evaluatedTasks.filter((t: { content?: string | null }) => (t.content?.length ?? 0) >= 100).length * 3;
            if (evaluatedTasks.length >= 5) pts += 10;
            const realScore = Math.min(pts, 100);
            const dbScore = Number(projectData?.score ?? 0);

            if (realScore !== dbScore) {
              setProject(prev => prev ? { ...prev, score: realScore } : prev);
              // Persistir no DB em background
              supabase.from("projects").update({ score: realScore }).eq("id", projectId).then(() => {});
            }
          }
        }
      }
    };

    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, router]);

  useEffect(() => {
    // Listen for custom event from sidebar
    const handleOpenCard = (event: Event) => {
      const customEvent = event as CustomEvent<{ cardId: string }>;
      setActiveDialog(customEvent.detail.cardId);
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
      id: "valuation",
      icon: TrendingUp,
      title: "Valuation",
      description: "Valor estimado do seu projeto",
      preview: project ? (
        <div className="mt-3">
          <div className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0,
            }).format(Number(project.valuation || 0))}
          </div>
        </div>
      ) : null,
      dialogTitle: "Valuation do Projeto",
      dialogContent: (
        <div className="space-y-4">
          <div className="p-6 border rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="text-sm text-muted-foreground mb-2">Valor Estimado Atual</div>
            <div className="text-4xl font-bold text-primary">
              {project
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0,
                  }).format(Number(project.valuation || 0))
                : "R$ 0"}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            O valuation é calculado com base nas etapas concluídas e na qualidade das
            informações fornecidas. Complete mais etapas para aumentar o valor do seu projeto.
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
          onSave={(content) => saveStage('etapa1', content)}
          existingContent={etapaContent['etapa1']}
          initialIdea={project?.description || ""}
          storageKey={projectId ? `${projectId}_etapa1` : undefined}
          nextStageId="etapa2"
          nextStageTitle="Pesquisa de Mercado"
          onGoToNextStage={() => {
            setActiveDialog(null);
            setTimeout(() => setActiveDialog('etapa2'), 300);
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
          onSave={(content) => saveStage('etapa2', content)}
          existingContent={etapaContent['etapa2']}
          initialIdea={project?.description || ""}
          storageKey={projectId ? `${projectId}_etapa2` : undefined}
          nextStageId="etapa3"
          nextStageTitle="Proposta de Valor"
          onGoToNextStage={() => {
            setActiveDialog(null);
            setTimeout(() => setActiveDialog('etapa3'), 300);
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
          onSave={(content) => saveStage('etapa3', content)}
          existingContent={etapaContent['etapa3']}
          initialIdea={project?.description || ""}
          storageKey={projectId ? `${projectId}_etapa3` : undefined}
          nextStageId="etapa4"
          nextStageTitle="Modelo de Negócio"
          onGoToNextStage={() => {
            setActiveDialog(null);
            setTimeout(() => setActiveDialog('etapa4'), 300);
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
          onSave={(content) => saveStage('etapa4', content)}
          existingContent={etapaContent['etapa4']}
          initialIdea={project?.description || ""}
          storageKey={projectId ? `${projectId}_etapa4` : undefined}
          nextStageId="etapa5"
          nextStageTitle="MVP"
          onGoToNextStage={() => {
            setActiveDialog(null);
            setTimeout(() => setActiveDialog('etapa5'), 300);
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
          onSave={(content) => saveStage('etapa5', content)}
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

  const medalhaAtual = getMedalha();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Novo Cabeçalho Superior */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b">
          {/* Título e Subtítulo do Projeto */}
          <div className="flex-1 text-left">
            {project && (
              <>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  {project.name}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Startup criada em {project.created_at ? new Date(project.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                </p>
              </>
            )}
          </div>

          {/* Badges e Notificações */}
          <div className="flex items-center gap-3">
            {/* IVO Index Badge com Tooltip */}
            {project && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden sm:flex items-center gap-2.5 px-5 py-2.5 bg-primary/10 rounded-full hover:bg-primary/15 transition-colors cursor-pointer">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span className="text-base font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0,
                      }).format(Number(project.ivo_index ?? project.valuation ?? 100))}
                    </span>
                    {/* Indicador de índice parcial */}
                    {(!project.ivo_o || project.ivo_o === 5) && (!project.ivo_m || project.ivo_m === 5) && (
                      <span className="text-xs text-amber-500 font-normal">~</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[220px]">
                  <p className="font-semibold mb-1">IVO Index</p>
                  <p className="text-xs">O:{(project.ivo_o ?? 5).toFixed(1)} M:{(project.ivo_m ?? 5).toFixed(1)} V:{(project.ivo_v ?? 5).toFixed(1)}</p>
                  <p className="text-xs">E:{(project.ivo_e ?? 5).toFixed(1)} T:{(project.ivo_t ?? 5).toFixed(1)} D:{(project.ivo_d ?? 1).toFixed(1)}</p>
                  {(!project.ivo_o || project.ivo_o === 5) && (
                    <p className="text-xs text-amber-400 mt-1">⚠ Índice parcial — complete mais etapas</p>
                  )}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Score Badge com Tooltip — escala 0-10 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-yellow-500/10 rounded-full hover:bg-yellow-500/15 transition-colors cursor-pointer">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  <span className="text-base font-semibold">{(Number(project?.score ?? 0) / 10).toFixed(1)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Score IdeorAI: {(Number(project?.score ?? 0) / 10).toFixed(1)} / 10</p>
              </TooltipContent>
            </Tooltip>

            {/* Medalha Badge (PNG) com Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors ${medalhaAtual.color === 'text-gray-500' ? 'bg-gray-500/10 hover:bg-gray-500/15' : 'bg-purple-500/10 hover:bg-purple-500/20'}`}>
                  <Image
                    src={medalhaAtual.badge}
                    alt={medalhaAtual.nome}
                    width={27}
                    height={27}
                    className="object-contain"
                  />
                  <span className={`text-base font-semibold ${medalhaAtual.color}`}>{medalhaAtual.nome}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Badge: {medalhaAtual.nome}</p>
              </TooltipContent>
            </Tooltip>

            {/* Certificado Badge com Tooltip - On/Off baseado em etapas */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full transition-colors ${
                    todasEtapasCompletas
                      ? 'bg-green-500/10 hover:bg-green-500/20'
                      : 'bg-muted hover:bg-muted/80 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!todasEtapasCompletas}
                >
                  <FileCheck2 className={`h-6 w-6 ${todasEtapasCompletas ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={`text-base font-semibold ${todasEtapasCompletas ? 'text-green-500' : 'text-muted-foreground'}`}>
                    Certificado Ideor
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Certificado Ideor</p>
              </TooltipContent>
            </Tooltip>

            {/* Publicar no Marketplace */}
            {completedStages.filter(s => s > 0).length >= 1 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setAnunciarOpen(true)}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-sm font-medium transition-colors"
                  >
                    <Rocket className="h-4 w-4" />
                    Publicar
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Publicar projeto no Marketplace</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Notificações */}
            <button className="relative p-3 hover:bg-muted rounded-full transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </button>

            {/* Botão de excluir projeto */}
            {projectId && project && (
              <DeleteProjectButton
                projectId={projectId}
                projectName={project.name || 'Projeto'}
                variant="full"
                onDeleted={() => router.push('/dashboard')}
              />
            )}

            {/* Logout */}
            <div className="ml-2">
              <LogoutButton />
            </div>
          </div>
        </div>

      {/* Barra de Progresso % */}
      {(() => {
        const completedCount = completedStages.filter(s => s > 0).length;
        const pct = Math.round(completedCount / 5 * 100);
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso do projeto</span>
              <span className="font-medium">{completedCount}/5 etapas · {pct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })()}

      {/* Linha de Progressão */}
      <ProjectProgressLine currentStage={currentStage} completedStages={completedStages} />

      {/* Analytics Panel */}
      {projectId && Object.keys(etapaContent).length > 0 && (
        <ProjectAnalyticsPanel
          etapaContent={etapaContent}
          completedStages={completedStages}
          onPublishToMarketplace={() => setAnunciarOpen(true)}
        />
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const isBloqueado = isEtapaBloqueada(card.id);
          const etapaAnterior = getEtapaAnteriorNome(card.id);
          
          // Verificar se é um card de etapa (etapa1, etapa2, etc)
          const etapaMatch = card.id.match(/^etapa(\d+)$/);
          const etapaNum = etapaMatch ? parseInt(etapaMatch[1]) : null;
          const stageStatus = etapaNum 
            ? stageStatuses.find(s => s.stageNumber === etapaNum)?.status 
            : null;

          // Verificar se é um card de etapa (etapa1-5) para navegar para página dedicada
          const handleCardClick = () => {
            if (isBloqueado) return;
            
            if (etapaNum) {
              // Navegar para página dedicada da etapa
              router.push(`/projeto/${projectId}/fase2/etapa${etapaNum}`);
            } else {
              // Cards não-etapa (roadmap, valuation, etc) - abrir modal
              setActiveDialog(card.id);
            }
          };

          return (
            <Tooltip key={card.id}>
              <TooltipTrigger asChild>
                <div
                  onClick={handleCardClick}
                  className={`bg-card border rounded-lg p-6 transition-all duration-300 relative ${
                    isBloqueado
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                  }`}
                >
                  {/* Ícone de cadeado para etapas bloqueadas */}
                  {isBloqueado && (
                    <div className="absolute top-3 right-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-6 w-6 ${isBloqueado ? 'text-muted-foreground' : 'text-primary'}`} />
                    <h3 className="font-semibold text-lg">{card.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                  
                  {/* Badge de status da etapa */}
                  {stageStatus && stageStatus !== 'valid' && !isBloqueado && (
                    <div className="mt-3">
                      <StageBadge status={stageStatus} />
                    </div>
                  )}
                  
                  {card.preview && <div className="mt-2">{card.preview}</div>}
                </div>
              </TooltipTrigger>
              {isBloqueado && (
                <TooltipContent>
                  <p>Complete &quot;{etapaAnterior}&quot; para desbloquear</p>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>

      {/* Modais */}
      {cards.map((card) => (
        <CardDialog
          key={`dialog-${card.id}`}
          title={card.dialogTitle}
          content={card.dialogContent}
          isOpen={activeDialog === card.id}
          onClose={() => setActiveDialog(null)}
        />
      ))}

      {/* Modal de anunciar no Marketplace */}
      <AnunciarModal
        open={anunciarOpen}
        onClose={() => setAnunciarOpen(false)}
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
