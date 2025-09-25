// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // -------- Server Action para criar projeto --------
  async function createProject() {
    "use server";
    const sb = await createClient();

    // cria um projeto básico
    const { data, error } = await sb
      .from("projects")
      .insert({
        owner_id: user!.id,
        name: "Nova Startup",
        description: null,
      })
      .select("id")
      .single();

    if (error) {
      // trate como preferir (poderia usar cookies/redirect com msg)
      console.error(error);
      redirect("/dashboard");
    }

    // pode mandar para o fluxo de edição/criação
    redirect(`/idea/create?project_id=${data!.id}`);
  }

  // --------- buscar todos os projetos do usuário ----------
  const { data: projects, error: loadErr } = await supabase
    .from("projects")
    .select("id, name, description, score, valuation, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (loadErr) {
    console.error(loadErr);
  }

  type UserMetadata = { full_name?: string } & Record<string, unknown>;
  const meta = (user.user_metadata as UserMetadata) || {};
  const displayName = meta.full_name ?? user.email ?? "User";

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm opacity-80">Bem-vindo(a), {displayName}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <LogoutButton />
          {/* Botão "Criar uma nova Startup" logo abaixo do logout */}
          <form action={createProject}>
            <Button type="submit" className="w-full">
              Criar uma nova Startup
            </Button>
          </form>
        </div>
      </div>

      {/* Cards de projetos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(projects ?? []).map((p) => (
          <article
            key={p.id}
            className="bg-card border rounded-lg p-5 flex flex-col gap-3"
          >
            <header className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-lg">{p.name}</h3>
                {p.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {p.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Sem descrição
                  </p>
                )}
              </div>
            </header>

            <div className="mt-1 text-sm">
              <span className="opacity-70">Valuation:</span>{" "}
              <strong>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                }).format(Number(p.valuation))}
              </strong>
            </div>

            {/* Barra de score */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="opacity-70">Score</span>
                <strong>{Number(p.score).toFixed(1)}</strong>
              </div>
              <div className="w-full h-2 rounded bg-muted relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-primary"
                  style={{ width: `${Math.min(100, Number(p.score) * 10)}%` }}
                />
              </div>
            </div>

            <footer className="mt-3 text-xs text-muted-foreground">
              Última atualização:{" "}
              {new Date(p.updated_at).toLocaleDateString("pt-BR")}
            </footer>
          </article>
        ))}

        {/* Card vazio quando não há projetos */}
        {projects?.length === 0 && (
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-2">Suas Startups</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Você ainda não criou nenhuma startup.
            </p>
            <form action={createProject}>
              <Button type="submit">Criar sua primeira Startup</Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
