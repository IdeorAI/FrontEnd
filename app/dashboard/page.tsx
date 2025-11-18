// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { DashboardFilters } from "@/components/dashboard-filters";
import categories from "@/lib/data/categories.json";
import { RoadmapBar } from "@/components/roadmap-bar";
import { ProjectCardLink } from "@/components/project-card-link";
import { CreateProjectButton } from "@/components/create-project-button";
import { TrendingUp, Star, Award } from "lucide-react";

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
      "id, name, description, score, valuation, updated_at, created_at, category, current_phase, tasks(id, phase, status)"
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

  type UserMetadata = { full_name?: string } & Record<string, unknown>;
  const meta = (user.user_metadata as UserMetadata) || {};
  const displayName = meta.full_name ?? user.email ?? "User";

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
          <p className="text-sm opacity-80">Bem-vindo(a), {displayName}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <LogoutButton />
          <CreateProjectButton />
        </div>
      </div>

      {/* HEADER de filtros/busca/ordenação */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
          <h2 className="text-lg font-semibold text-[#8c7dff]">
            Minhas Startups
          </h2>
          <div className="w-full sm:flex-1 sm:max-w-2xl">
            <DashboardFilters />
          </div>
        </div>
      </div>

      {/* Cards */}
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
            <ProjectCardLink projectId={p.id} key={p.id}>
              <article className="bg-card border rounded-lg p-5 flex gap-3 relative hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer h-[280px]">
                {/* Conteúdo principal (lado esquerdo) */}
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                  <header className="flex-1">
                    <div className="overflow-hidden">
                      <h3 className="font-semibold text-lg truncate">{projectName}</h3>
                      {p.category && (
                        <div className="text-xs font-bold text-primary mt-1 mb-2">
                          {
                            (
                              categories.find((c) => c.value === p.category) || {
                                label: p.category,
                              }
                            ).label
                          }
                        </div>
                      )}
                      {p.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                          {p.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic mt-2">
                          Sem descrição
                        </p>
                      )}
                    </div>
                  </header>

                  {/* Barra de roadmap */}
                  <div className="mt-auto">
                    <RoadmapBar completed={completedTasks} total={8} />
                  </div>

                  <footer className="text-xs text-muted-foreground">
                    Atualizado: {new Date(p.updated_at).toLocaleDateString("pt-BR")}
                  </footer>
                </div>

                {/* Badges laterais (lado direito) */}
                <div className="flex flex-col gap-1.5 items-end justify-start py-1 min-w-[90px]">
                  {/* Valuation Badge */}
                  <div className="px-3 py-2 bg-primary/10 rounded-full hover:bg-primary/15 transition-colors cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <TrendingUp className="h-3 w-3 text-primary" />
                      <span className="text-[10px] opacity-60">Valuation</span>
                    </div>
                    <div className="text-xs font-bold text-primary text-right">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0,
                      }).format(Number(p.valuation))}
                    </div>
                  </div>

                  {/* Score Badge */}
                  <div className="px-3 py-2 bg-yellow-500/10 rounded-full hover:bg-yellow-500/15 transition-colors cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] opacity-60">Score</span>
                    </div>
                    <div className="text-xs font-bold text-yellow-600 text-right">
                      {Number(p.score).toFixed(1)}
                    </div>
                  </div>

                  {/* Medalha Badge */}
                  <div className={`px-3 py-2 rounded-full transition-colors cursor-pointer ${
                    medalha.color === 'text-gray-500'
                      ? 'bg-gray-500/10 hover:bg-gray-500/15'
                      : medalha.color === 'text-blue-500'
                      ? 'bg-blue-500/10 hover:bg-blue-500/15'
                      : medalha.color === 'text-purple-500'
                      ? 'bg-purple-500/10 hover:bg-purple-500/15'
                      : medalha.color === 'text-orange-500'
                      ? 'bg-orange-500/10 hover:bg-orange-500/15'
                      : 'bg-green-500/10 hover:bg-green-500/15'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Award className={`h-3 w-3 ${medalha.color}`} />
                      <span className="text-[10px] opacity-60">Medalha</span>
                    </div>
                    <div className={`text-xs font-bold ${medalha.color} text-right`}>
                      {medalha.nome}
                    </div>
                  </div>
                </div>
              </article>
            </ProjectCardLink>
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
    </div>
  );
}
