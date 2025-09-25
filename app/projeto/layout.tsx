// app/dashboard/layout.tsx
import { AppSidebar } from "@/components/app-sidebar-p"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  type UserMetadata = { full_name?: string } & Record<string, unknown>
  const meta = user.user_metadata as UserMetadata

  const userProps = {
    name: meta.full_name ?? user.email ?? "User",
    email: user.email ?? "",
  }

  // 🔹 Busca o projeto do usuário (uma linha por owner_id)
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("owner_id", user.id)
    .maybeSingle()

  // 🔹 Fallback para "Meu Projeto" se não houver nome
  const projectName = project?.name?.trim() || "Meu Projeto"

  return (
    <div className="flex">
      <AppSidebar user={userProps} projectName={projectName} />
      <main className="flex-1 lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
