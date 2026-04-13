import { getAuthUser } from "@/lib/auth/get-auth-user"
import { Trophy } from "lucide-react"

type Project = {
  id: string
  name: string
  score: number | null
  ivo_index: number | null
  owner_id: string
}

const MEDALS = ["🥇", "🥈", "🥉"]

export default async function RankingPage() {
  const { supabase, user } = await getAuthUser()

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, score, ivo_index, owner_id")
    .eq("is_public", true)
    .gt("score", 0)
    .order("score", { ascending: false })
    .limit(10)

  const ranked = (projects ?? []) as Project[]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Ranking</h1>
          <p className="text-muted-foreground mt-0.5">Top projetos por pontuação de validação</p>
          <p className="text-xs text-muted-foreground mt-1">Projetos com score 0 não aparecem no ranking</p>
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
          <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Nenhum projeto público com pontuação ainda.</p>
          <p className="text-sm mt-1">Complete etapas e publique seu projeto para aparecer aqui.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-lg divide-y divide-border">
          {ranked.map((project, index) => {
            const isOwn = user?.id === project.owner_id
            return (
              <div
                key={project.id}
                className={`flex items-center gap-4 p-4 ${isOwn ? "border-l-4 border-l-primary bg-primary/5" : ""}`}
              >
                <span className="text-2xl w-8 text-center flex-shrink-0">
                  {index < 3 ? MEDALS[index] : <span className="text-muted-foreground font-mono text-sm">{index + 1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{project.name}</p>
                    {isOwn && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full flex-shrink-0">
                        Seu projeto
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold text-primary">
                    {project.ivo_index !== null
                      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(project.ivo_index)
                      : "R$ 100"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Score: {project.score !== null ? (project.score / 10).toFixed(1) : "—"}/10
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
