"use client";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import { TeamAvatars } from "@/components/team-avatars";
import { CardDialog } from "@/components/card-dialog";
import { AIStageCard } from "@/components/ai-stage-card";
import { ProjectProgressLine } from "@/components/project-progress-line";
import { generateDocumentByStage } from "@/lib/gemini-documents";
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
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, unknown> } | null>(null);
  const [project, setProject] = useState<{ name?: string; valuation?: number; description?: string; created_at?: string } | null>(null);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [etapaContent, setEtapaContent] = useState<Record<string, string>>({});
  const [currentStage, setCurrentStage] = useState(1); // Etapa atual do projeto
  const [completedStages, setCompletedStages] = useState<number[]>([0]); // Etapas completas (0=Início sempre completo)
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

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
    if (completedCount >= 5 && completedCount < 7) {
      return {
        nome: "Construtor",
        badge: "/assets/badges/badge_construtor.png",
        color: "text-green-500"
      };
    }
    if (completedCount >= 7) {
      return {
        nome: "Escalador",
        badge: "/assets/badges/badge_escalador.png",
        color: "text-pink-500"
      };
    }
    return {
      nome: "Iniciante",
      badge: "/assets/badges/badge_visionário PENDENTE.png",
      color: "text-gray-500"
    };
  };

  // Verificar se todas etapas estão completas (exceto Início)
  const todasEtapasCompletas = completedStages.filter(s => s > 0).length >= 7;

  // Função para verificar se uma etapa está bloqueada
  const isEtapaBloqueada = (etapaId: string): boolean => {
    // Etapa 1 sempre desbloqueada
    if (etapaId === 'etapa1') return false;

    // Para outras etapas, verificar se a anterior está completa
    const etapaNumero = parseInt(etapaId.replace('etapa', ''));
    if (isNaN(etapaNumero)) return false; // Cards não-etapa (roadmap, valuation, etc)

    // Verificar se a etapa anterior está completa
    const etapaAnterior = etapaNumero - 1;
    return !completedStages.includes(etapaAnterior);
  };

  // Obter nome da etapa anterior que precisa ser concluída
  const getEtapaAnteriorNome = (etapaId: string): string => {
    const etapaNumero = parseInt(etapaId.replace('etapa', ''));
    const nomesEtapas = [
      "Início",
      "Problema e Oportunidade", // etapa1
      "Pesquisa de Mercado",      // etapa2
      "Proposta de Valor",        // etapa3
      "Modelo de Negócio",        // etapa4
      "MVP",                      // etapa5
      "Equipe",                   // etapa6
      "Pitch Deck"                // etapa7
    ];
    return nomesEtapas[etapaNumero - 1] || "Etapa anterior";
  };

  // Handlers para as etapas de IA
  const handleGenerateEtapa = async (etapaId: 'etapa1' | 'etapa2' | 'etapa3' | 'etapa4', idea: string): Promise<string> => {
    if (!projectId || !user) {
      throw new Error("Project ID ou usuário não encontrado");
    }

    try {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser?.id) {
        throw new Error("Usuário não autenticado");
      }

      console.log("[DashPage] Gerando documento via Gemini direto...", { etapaId, ideaLength: idea.length });

      // Gerar conteúdo diretamente via Gemini (frontend)
      const geminiResponse = await generateDocumentByStage(
        etapaId,
        idea,
        currentUser.id
      );

      console.log("[DashPage] Gemini respondeu:", {
        contentLength: geminiResponse.content.length,
        tokensUsed: geminiResponse.tokensUsed,
        elapsedMs: geminiResponse.elapsedMs
      });

      return geminiResponse.content;
    } catch (error) {
      console.error("[DashPage] Erro ao gerar documento:", error);
      throw error;
    }
  };

  const handleSaveEtapa = async (etapaId: string, content: string): Promise<void> => {
    if (!projectId || !user) {
      throw new Error("Project ID ou usuário não encontrado");
    }

    const supabase = createClient();

    try {
      // Verificar se já existe uma task para este projeto e fase
      const { data: existingTask, error: searchError } = await supabase
        .from("tasks")
        .select("id")
        .eq("project_id", projectId)
        .eq("phase", etapaId)
        .maybeSingle();

      if (searchError) {
        console.error("Erro ao buscar task existente:", searchError);
        throw new Error(`Erro ao buscar task: ${searchError.message}`);
      }

      let result;
      if (existingTask) {
        // Atualizar task existente
        console.log("Atualizando task existente:", existingTask.id);
        result = await supabase
          .from("tasks")
          .update({
            content: content,
            status: "evaluated",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingTask.id)
          .select();
      } else {
        // Criar nova task
        console.log("Criando nova task para fase:", etapaId);
        result = await supabase
          .from("tasks")
          .insert({
            project_id: projectId,
            phase: etapaId,
            content: content,
            title: `Etapa ${etapaId}`,
            description: `Documento gerado para ${etapaId}`,
            status: "evaluated",
          })
          .select();
      }

      if (result.error) {
        console.error("Erro detalhado ao salvar no Supabase:", result.error);
        throw new Error(`Erro ao salvar: ${result.error.message}`);
      }

      console.log("Conteúdo salvo com sucesso:", result.data);

      // Atualizar estado local
      setEtapaContent((prev) => ({
        ...prev,
        [etapaId]: content,
      }));

      // 🆕 SPRINT 15: Atualizar progresso automaticamente
      const etapaNum = parseInt(etapaId.replace('etapa', '')); // "etapa1" → 1

      // Adiciona etapa aos completedStages se ainda não estiver
      setCompletedStages((prev) => {
        if (!prev.includes(etapaNum)) {
          const newCompleted = [...prev, etapaNum].sort((a, b) => a - b);

          // Atualiza currentStage para próxima etapa
          const maxCompleted = Math.max(...newCompleted.filter(n => n > 0));
          setCurrentStage(maxCompleted < 7 ? maxCompleted + 1 : 8);

          console.log("Progresso atualizado - Etapas completas:", newCompleted, "Etapa atual:", maxCompleted < 7 ? maxCompleted + 1 : 8);

          return newCompleted;
        }
        return prev;
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      throw error;
    }
  };

  const handleDownloadPDF = async (phase?: string) => {
    if (!projectId || !user) {
      alert("Projeto ou usuário não encontrado");
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser?.id) {
        alert("Usuário não autenticado");
        return;
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const endpoint = phase
        ? `${API_BASE}/api/projects/${projectId}/documents/export/pdf/${phase}`
        : `${API_BASE}/api/projects/${projectId}/documents/export/pdf`;

      console.log(`Baixando PDF${phase ? ` da fase ${phase}` : ' completo'}...`);

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

      console.log("PDF gerado com sucesso, baixando arquivo...");

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

      alert("PDF baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      alert(`Erro ao gerar PDF: ${error instanceof Error ? error.message : "Verifique se há documentos salvos."}`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        redirect("/login");
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
          .in("phase", ["etapa1", "etapa2", "etapa3", "etapa4"]);

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

          // Definir etapa atual como a próxima após a última completa
          const maxCompleted = Math.max(...completed);
          setCurrentStage(maxCompleted < 7 ? maxCompleted + 1 : 8);
        }
      }
    };

    loadData();
  }, [projectId]);

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
      description: "Acompanhe o progresso das 7 etapas do projeto",
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
              { num: 6, title: "Equipe", phase: "etapa6" },
              { num: 7, title: "Pitch Deck + Plano + Resumo", phase: "etapa7" },
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
                {Object.keys(etapaContent).filter(key => key.startsWith('etapa')).length} / 7 etapas
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
          onGenerate={(idea) => handleGenerateEtapa('etapa1', idea)}
          onSave={(content) => handleSaveEtapa('etapa1', content)}
          existingContent={etapaContent['etapa1']}
          initialIdea={project?.description || ""}
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
          onGenerate={(idea) => handleGenerateEtapa('etapa2', idea)}
          onSave={(content) => handleSaveEtapa('etapa2', content)}
          existingContent={etapaContent['etapa2']}
          initialIdea={project?.description || ""}
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
          onGenerate={(idea) => handleGenerateEtapa('etapa3', idea)}
          onSave={(content) => handleSaveEtapa('etapa3', content)}
          existingContent={etapaContent['etapa3']}
          initialIdea={project?.description || ""}
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
          onGenerate={(idea) => handleGenerateEtapa('etapa4', idea)}
          onSave={(content) => handleSaveEtapa('etapa4', content)}
          existingContent={etapaContent['etapa4']}
          initialIdea={project?.description || ""}
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
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Defina as funcionalidades essenciais do seu MVP, stack tecnológico e métricas de
            sucesso.
          </p>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm">
              Esta funcionalidade será implementada em breve. Você poderá acessar esta etapa
              através do menu lateral em &ldquo;Tasks&rdquo;.
            </p>
          </div>
        </div>
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
              { id: 'etapa2', title: 'Pesquisa de Mercado', hasContent: !!etapaContent['etapa2'] },
              { id: 'etapa3', title: 'Proposta de Valor', hasContent: !!etapaContent['etapa3'] },
              { id: 'etapa4', title: 'Modelo de Negócio', hasContent: !!etapaContent['etapa4'] },
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
            {/* Valuation Badge com Tooltip */}
            {project && project.valuation && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden sm:flex items-center gap-2.5 px-5 py-2.5 bg-primary/10 rounded-full hover:bg-primary/15 transition-colors cursor-pointer">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span className="text-base font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0,
                      }).format(Number(project.valuation))}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Valuation</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Score Badge com Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-yellow-500/10 rounded-full hover:bg-yellow-500/15 transition-colors cursor-pointer">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  <span className="text-base font-semibold">5.3</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Score</p>
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

            {/* Notificações */}
            <button className="relative p-3 hover:bg-muted rounded-full transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </button>

            {/* Logout */}
            <div className="ml-2">
              <LogoutButton />
            </div>
          </div>
        </div>

      {/* Linha de Progressão */}
      <ProjectProgressLine currentStage={currentStage} completedStages={completedStages} />

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const isBloqueado = isEtapaBloqueada(card.id);
          const etapaAnterior = getEtapaAnteriorNome(card.id);

          return (
            <Tooltip key={card.id}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => !isBloqueado && setActiveDialog(card.id)}
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
      </div>
    </TooltipProvider>
  );
}
