// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import { TeamAvatars } from "@/components/team-avatars";
import { IdeasCheckboxes } from "@/components/ideas-checkboxes";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  type UserMetadata = { full_name?: string } & Record<string, unknown>;
  const meta = user.user_metadata as UserMetadata;

  const userProps = {
    name: meta.full_name ?? user.email ?? "User",
    email: user.email ?? "",
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho superior */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard do Projeto</h1>
          <p className="text-sm opacity-80">Bem-vindo(a), {userProps.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <LogoutButton />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border rounded-lg p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <h3 className="font-semibold text-lg mb-2">Meus Projetos</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie e acompanhe seus projetos de startup
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <h3 className="font-semibold text-lg mb-2">Ideias</h3>
          <p className="text-sm text-muted-foreground">
            Crie e desenvolva novas ideias com ajuda da IA
          </p>
          {/* ⬇️ Checkboxes */}
          <IdeasCheckboxes />
        </div>

        <div className="bg-card border rounded-lg p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <h3 className="font-semibold text-lg mb-2">Progresso</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe seu progresso no desenvolvimento
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <h3 className="font-semibold text-lg mb-2">Análises</h3>
          <p className="text-sm text-muted-foreground">
            Visualize métricas e análises dos seus projetos
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <h3 className="font-semibold text-lg mb-2">Equipe</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie membros da equipe e colaboradores
          </p>
          {/* ⬇️ Avatares com tooltip */}
          <TeamAvatars />
        </div>

        <div className="bg-card border rounded-lg p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <h3 className="font-semibold text-lg mb-2">Relatórios</h3>
          <p className="text-sm text-muted-foreground">
            Acesse relatórios detalhados e insights
          </p>
          {/* ⬇️ Checkboxes */}
          <IdeasCheckboxes />
        </div>
      </div>
    </div>
  );
}
