// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { DashboardFilters } from "@/components/dashboard-filters";
import categories from "@/lib/data/categories.json";
import { ScoreBar } from "@/components/score-bar";
import { ProjectCardLink } from "@/components/project-card-link";
import { CreateProjectButton } from "@/components/create-project-button";

type PageProps = {
  searchParams?: {
    q?: string;
    cat?: string;
    score?: string; // 3 | 5 | 7 | 9
    val?: string; // lte_1k | gt_1k | gt_5k | ...
    status?: string; // dev | done
    sort?: string; // created_asc, created_desc, updated_desc, score_desc, valuation_desc, name_asc
  };
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ----- montar query dinamicamente -----
  let query = supabase
    .from("projects")
    .select(
      "id, name, description, score, valuation, updated_at, created_at, category, current_phase"
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

  return (
    <div className="space-y-6">
      {/* Cabeçalho superior */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm opacity-80">Bem-vindo(a), {displayName}</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <CreateProjectButton />
          <LogoutButton />
        </div>
      </div>

      {/* HEADER de filtros/busca/ordenação */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
          <h2 className="text-lg font-semibold text-[#8c7dff]">
            Suas Startups
          </h2>
          <div className="w-full sm:flex-1 sm:max-w-2xl">
            <DashboardFilters />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(projects ?? []).map((p) => (
          <ProjectCardLink projectId={p.id} key={p.id}>
            <article className="bg-card border rounded-lg p-5 flex flex-col gap-3 relative hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer h-[280px]">
              {/* Valuation destacado no canto superior direito */}
              <div className="absolute top-4 right-4 text-right">
                <div className="text-xs opacity-60 mb-0.5">Valuation</div>
                <div className="text-lg font-bold text-[#8c7dff]">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0,
                  }).format(Number(p.valuation))}
                </div>
              </div>

              <header className="flex items-start justify-between gap-3 pr-24 flex-1">
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-lg truncate">{p.name}</h3>
                  {p.category && (
                    <div className="text-xs text-muted-foreground">
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
                    <p className="text-sm text-muted-foreground line-clamp-3 mt-1">
                      {p.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic mt-1">
                      Sem descrição
                    </p>
                  )}
                </div>
              </header>

              {/* Barra de score */}
              <div className="mt-auto">
                <ScoreBar score={Number(p.score)} />
              </div>

              <footer className="text-xs text-muted-foreground">
                Atualizado: {new Date(p.updated_at).toLocaleDateString("pt-BR")}
              </footer>
            </article>
          </ProjectCardLink>
        ))}

        {projects?.length === 0 && (
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">Suas Startups</h3>
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
