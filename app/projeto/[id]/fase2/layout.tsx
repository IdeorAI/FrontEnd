import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StageProgressNav } from "@/components/stage-progress-nav";
import { getProjectTasks } from "@/lib/api/tasks";

// Marcar como dinâmico para Next.js 15+
export const dynamic = 'force-dynamic';

export default async function Fase2Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { id: projectId } = await params;

  // Buscar tasks do projeto para determinar progresso
  let completedStages: string[] = [];
  let currentStage = "etapa1";

  try {
    const tasks = await getProjectTasks(projectId, user.id);
    completedStages = tasks
      .filter((t) => t.status === "evaluated")
      .map((t) => t.phase);

    // Determinar etapa atual (primeira não completa, máx 5 etapas)
    const allStages = [
      "etapa1",
      "etapa2",
      "etapa3",
      "etapa4",
      "etapa5",
    ];
    currentStage =
      allStages.find((stage) => !completedStages.includes(stage)) || "etapa5";
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Progresso da Fase Projeto</h2>
        <StageProgressNav
          projectId={projectId}
          currentStage={currentStage}
          completedStages={completedStages}
        />
      </div>

      {/* Conteúdo da etapa */}
      {children}
    </div>
  );
}
