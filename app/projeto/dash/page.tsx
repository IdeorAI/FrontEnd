"use client";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import { TeamAvatars } from "@/components/team-avatars";
import { IdeasCheckboxes } from "@/components/ideas-checkboxes";
import { CardDialog } from "@/components/card-dialog";
import { AIStageCard } from "@/components/ai-stage-card";
import { generateDocument } from "@/lib/api/documents";
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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, unknown> } | null>(null);
  const [project, setProject] = useState<{ name?: string; valuation?: number; description?: string } | null>(null);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [etapaContent, setEtapaContent] = useState<Record<string, string>>({});
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  // Handlers para as etapas de IA
  const handleGenerateEtapa = async (etapaId: 'etapa2' | 'etapa3' | 'etapa4', idea: string): Promise<string> => {
    if (!projectId || !user) {
      throw new Error("Project ID ou usuário não encontrado");
    }

    try {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser?.id) {
        throw new Error("Usuário não autenticado");
      }

      const response = await generateDocument(
        projectId,
        {
          phase: etapaId,
          inputs: {
            ideia: idea,
          },
        },
        currentUser.id
      );

      return response.generatedContent;
    } catch (error) {
      console.error("Erro ao gerar documento:", error);
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
    } catch (error) {
      console.error("Erro ao salvar:", error);
      throw error;
    }
  };

  const handleDownloadPDF = async () => {
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
      const response = await fetch(
        `${API_BASE}/api/projects/${projectId}/documents/export/pdf`,
        {
          method: 'GET',
          headers: {
            'x-user-id': currentUser.id,
          },
        }
      );

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
      a.download = `Relatorio_Projeto_${projectId}_${new Date().toISOString().split('T')[0]}.pdf`;
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
          .select("phase, content")
          .eq("project_id", projectId)
          .in("phase", ["etapa2", "etapa3", "etapa4"]);

        if (tasksError) {
          console.error("Erro ao buscar tasks:", tasksError);
        } else if (tasksData) {
          const contentMap: Record<string, string> = {};
          tasksData.forEach((task: { phase: string; content: string | null }) => {
            if (task.content) {
              contentMap[task.phase] = task.content;
            }
          });
          setEtapaContent(contentMap);
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

  type UserMetadata = { full_name?: string } & Record<string, unknown>;
  const meta = user.user_metadata as UserMetadata;

  const userProps = {
    name: meta.full_name ?? user.email ?? "User",
    email: user.email ?? "",
  };

  // Definição dos cards
  const cards = [
    {
      id: "tasks",
      icon: ListChecks,
      title: "Tasks",
      description: "Acompanhe o progresso das 7 etapas do projeto",
      dialogTitle: "Tasks - Etapas do Projeto",
      dialogContent: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Acompanhe o progresso de cada etapa do desenvolvimento da sua startup:
          </p>
          <div className="space-y-3">
            {[
              { num: 1, title: "Problema e Oportunidade", status: "pending" },
              { num: 2, title: "Pesquisa de Mercado", status: "pending" },
              { num: 3, title: "Proposta de Valor", status: "pending" },
              { num: 4, title: "Modelo de Negócio", status: "pending" },
              { num: 5, title: "MVP", status: "pending" },
              { num: 6, title: "Equipe", status: "pending" },
              { num: 7, title: "Pitch Deck + Plano + Resumo", status: "pending" },
            ].map((etapa) => (
              <div key={etapa.num} className="flex items-center gap-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  disabled
                />
                <div className="flex-1">
                  <div className="font-medium">Etapa {etapa.num}</div>
                  <div className="text-sm text-muted-foreground">{etapa.title}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                  {etapa.status === "pending" ? "Pendente" : "Concluída"}
                </span>
              </div>
            ))}
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
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nesta etapa, você irá definir claramente o problema que sua startup resolve e a
            oportunidade de mercado.
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
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Baixar Relatório PDF
            </button>
          </div>

          <IdeasCheckboxes />

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
    <div className="space-y-6">
      {/* Cabeçalho superior */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard do Projeto</h1>
          <p className="text-sm opacity-80">Bem-vindo(a), {userProps.name}</p>
          {project && (
            <p className="text-xs text-muted-foreground mt-1">
              Projeto: {project.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <LogoutButton />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => setActiveDialog(card.id)}
              className="bg-card border rounded-lg p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-lg">{card.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{card.description}</p>
              {card.preview && <div className="mt-2">{card.preview}</div>}
            </div>
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
  );
}
