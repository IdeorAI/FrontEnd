"use client";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import { TeamAvatars } from "@/components/team-avatars";
import { IdeasCheckboxes } from "@/components/ideas-checkboxes";
import { CardDialog } from "@/components/card-dialog";
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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, unknown> } | null>(null);
  const [project, setProject] = useState<{ name?: string; valuation?: number } | null>(null);
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

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
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Realize uma pesquisa aprofundada do seu mercado-alvo, incluindo análise de
            concorrentes e dimensionamento TAM/SAM/SOM.
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
      id: "etapa3",
      icon: Target,
      title: "Proposta de Valor",
      description: "Defina sua proposta única de valor",
      dialogTitle: "Etapa 3: Proposta de Valor",
      dialogContent: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Articule claramente o valor único que sua solução oferece aos clientes e como ela
            se diferencia da concorrência.
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
      id: "etapa4",
      icon: Briefcase,
      title: "Modelo de Negócio",
      description: "Estruture seu modelo de negócio",
      dialogTitle: "Etapa 4: Modelo de Negócio",
      dialogContent: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Desenvolva seu Business Model Canvas e defina como sua startup irá gerar receita e
            se sustentar financeiramente.
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
