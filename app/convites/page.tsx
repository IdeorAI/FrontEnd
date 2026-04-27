"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Bell, Check, X, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Invite = {
  id: string;
  projectId: string;
  projectName: string;
  inviterName: string;
  inviterEmail: string;
  role: "viewer" | "editor";
  invitedAt: string;
  expiresAt: string;
};

export default function ConvitesPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);

      const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
      const res = await fetch(`${API}/api/projects/invites/pending`, {
        headers: { "x-user-id": user.id },
      });

      if (res.ok) {
        const data: Invite[] = await res.json();
        // Enriquecer com nomes dos projetos via Supabase direto
        const enriched = await Promise.all(
          data.map(async (inv) => {
            try {
              const { data: proj } = await supabase
                .from("projects")
                .select("name")
                .eq("id", inv.projectId)
                .single();
              return { ...inv, projectName: proj?.name ?? inv.projectId };
            } catch {
              return inv;
            }
          })
        );
        setInvites(enriched);
      }
      setLoading(false);
    })();
  }, [router]);

  async function respond(invite: Invite, accept: boolean) {
    if (!userId) return;
    setResponding(invite.id);
    const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    try {
      const res = await fetch(
        `${API}/api/projects/${invite.projectId}/members/${invite.id}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": userId },
          body: JSON.stringify({ accept }),
        }
      );
      if (res.ok) {
        setInvites((prev) => prev.filter((i) => i.id !== invite.id));
        if (accept) router.refresh();
      }
    } finally {
      setResponding(null);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Convites Pendentes</h1>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando convites...</span>
        </div>
      )}

      {!loading && invites.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p>Nenhum convite pendente.</p>
            <p className="text-sm mt-1">Quando alguém te convidar para colaborar num projeto, vai aparecer aqui.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {invites.map((inv) => {
          const isEditor = inv.role === "editor";
          const isResponding = responding === inv.id;
          const expiresAt = new Date(inv.expiresAt);
          const daysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000));

          return (
            <Card key={inv.id} className="border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{inv.projectName}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Convidado por <span className="font-medium text-foreground">{inv.inviterName || inv.inviterEmail || "alguém"}</span>
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    isEditor
                      ? "bg-blue-500/15 text-blue-500"
                      : "bg-gray-500/15 text-gray-400"
                  }`}>
                    {isEditor ? "Editor" : "Visualizador"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  {isEditor
                    ? "Você poderá gerar documentos e editar etapas deste projeto."
                    : "Você terá acesso somente de leitura — poderá ver as etapas e documentos."}
                  {" "}Expira em {daysLeft} dia{daysLeft !== 1 ? "s" : ""}.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => respond(inv, true)}
                    disabled={isResponding}
                    className="gap-1.5"
                  >
                    {isResponding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respond(inv, false)}
                    disabled={isResponding}
                    className="gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" />
                    Recusar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
