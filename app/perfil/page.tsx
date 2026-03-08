import { getAuthUser } from "@/lib/auth/get-auth-user";
import { User, Mail, Shield } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export default async function PerfilPage() {
  const { user, userProps } = await getAuthUser();

  const initials =
    userProps.name
      .split(" ")
      .filter((n: string) => n.length > 0)
      .slice(0, 2)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais</p>
      </div>

      <div className="bg-card border rounded-lg p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{userProps.name}</h2>
          <p className="text-muted-foreground text-sm">{userProps.email}</p>
          <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
            Membro IdeorAI
          </span>
        </div>
      </div>

      <div className="bg-card border rounded-lg divide-y divide-border">
        <div className="flex items-center gap-3 p-4">
          <User className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Nome completo</p>
            <p className="font-medium">{userProps.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{userProps.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">ID do usuário</p>
            <p className="font-mono text-sm text-muted-foreground">{user.id}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="font-medium">Sair da conta</p>
          <p className="text-sm text-muted-foreground">Encerrar sessão atual</p>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
