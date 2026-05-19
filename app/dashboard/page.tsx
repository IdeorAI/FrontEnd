// app/dashboard/page.tsx
import type { Metadata } from 'next'
import { redirect } from "next/navigation";
import { Suspense } from 'react';
import { cache } from 'react';

export const metadata: Metadata = {
  title: 'Meus Projetos — IdeorAI',
  description: 'Gerencie e acompanhe suas ideias de startup.',
}
import { createClient } from "@/lib/supabase/server";

// Deduplicate Supabase client creation within the same render pass
const getSupabaseClient = cache(async () => createClient());
import { LogoutButton } from "@/components/logout-button";
import { PaginationControls } from "@/components/pagination-controls";

// Marcar como dinâmico para Next.js 15+
export const dynamic = 'force-dynamic';

import { DashboardFilters } from "@/components/dashboard-filters";
import { updateProjectScore } from './actions';
import { CreateProjectButton } from "@/components/create-project-button";
import { Users } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { TooltipProvider } from "@/components/ui/tooltip";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    cat?: string;
    score?: string; // 3 | 5 | 7 | 9
    val?: string; // lte_1k | gt_1k | gt_5k | ...
    status?: string; // dev | done
    sort?: string; // created_asc, created_desc, updated_desc, score_desc, valuation_desc, name_asc
    page?: string;
  }>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const PAGE_SIZE = 12;
  const page = Math.max(1, Number(searchParams?.page ?? '1'));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // ----- montar query dinamicamente -----
  let query = supabase
    .from("projects")
    .select(
      "id, name, description, score, valuation, ivo_index, ivo_o, ivo_m, ivo_v, ivo_e, ivo_t, ivo_d, updated_at, created_at, category, current_phase, tasks(id, phase, status, content)",
      { count: 'exact' }
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

  const { data: projects, count, error: loadErr } = await query.range(from, to);
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
        {(projects ?? []).map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}

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

      <Suspense fallback={null}>
        <PaginationControls page={page} total={count ?? 0} pageSize={PAGE_SIZE} />
      </Suspense>

      {/* ── Compartilhados comigo ──────────────────────────────────────── */}
      {sharedProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#8c7dff]" />
            <h2 className="text-lg font-semibold text-[#8c7dff]">Compartilhados comigo</h2>
          </div>
          <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedProjects.map(({ role, project: p }) => (
              <ProjectCard
                key={p.id}
                project={p}
                role={role === "editor" ? "editor" : "viewer"}
              />
            ))}
          </div>
          </TooltipProvider>
        </div>
      )}

    </div>
  );
}
