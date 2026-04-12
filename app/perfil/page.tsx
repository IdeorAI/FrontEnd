"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Edit2, Save, X, KeyRound, Trash2 } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  name: string;
  bio: string | null;
  email: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth/login"); return; }

      const { data: p } = await supabase
        .from("profiles")
        .select("id, name, bio")
        .eq("id", user.id)
        .single();

      setProfile({
        id: user.id,
        name: p?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Usuário",
        bio: p?.bio ?? null,
        email: user.email || "",
      });
    };
    load();
  }, [router]);

  const initials = profile?.name
    ? profile.name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase()
    : "?";

  const handleStartEdit = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditBio(profile.bio || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!profile || !editName.trim()) return;
    setIsSaving(true);
    try {
      const supabase = createClient();

      await supabase
        .from("profiles")
        .update({ name: editName.trim(), bio: editBio.trim() || null })
        .eq("id", profile.id);

      await supabase.auth.updateUser({ data: { name: editName.trim() } });

      setProfile(prev => prev ? { ...prev, name: editName.trim(), bio: editBio.trim() || null } : prev);
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    setIsSendingReset(true);
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      toast.success("E-mail de redefinição enviado!", {
        description: "Verifique sua caixa de entrada.",
      });
    } catch {
      toast.error("Erro ao enviar e-mail de redefinição.");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "CONFIRMAR") {
      toast.error('Digite "CONFIRMAR" para prosseguir.');
      return;
    }
    toast.error("Para excluir sua conta, entre em contato com suporte@ideorai.com", {
      duration: 8000,
    });
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais</p>
      </div>

      {/* Avatar + resumo */}
      <div className="bg-card border rounded-lg p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold">{profile.name}</h2>
          <p className="text-muted-foreground text-sm">{profile.email}</p>
          {profile.bio && (
            <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{profile.bio}</p>
          )}
          <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
            Membro IdeorAI
          </span>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={handleStartEdit} className="gap-2 flex-shrink-0">
            <Edit2 className="h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      {/* Formulário de edição */}
      {isEditing && (
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold">Editar Perfil</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome *</label>
            <Input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Seu nome completo"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={editBio}
              onChange={e => setEditBio(e.target.value)}
              placeholder="Uma breve descrição sobre você..."
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground text-right">{editBio.length}/300</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isSaving || !editName.trim()} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Informações de conta */}
      <div className="bg-card border rounded-lg divide-y divide-border">
        <div className="flex items-center gap-3 p-4">
          <User className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Nome completo</p>
            <p className="font-medium">{profile.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{profile.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">ID do usuário</p>
            <p className="font-mono text-sm text-muted-foreground">{profile.id}</p>
          </div>
        </div>
      </div>

      {/* Segurança */}
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold">Segurança</h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">Alterar senha</p>
            <p className="text-xs text-muted-foreground">Enviaremos um link para seu e-mail</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePasswordReset}
            disabled={isSendingReset}
            className="gap-2"
          >
            <KeyRound className="h-4 w-4" />
            {isSendingReset ? "Enviando..." : "Redefinir senha"}
          </Button>
        </div>
      </div>

      {/* Sessão + Excluir conta */}
      <div className="bg-card border rounded-lg divide-y divide-border">
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Sair da conta</p>
            <p className="text-sm text-muted-foreground">Encerrar sessão atual</p>
          </div>
          <LogoutButton />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-destructive">Excluir conta</p>
            <p className="text-sm text-muted-foreground">Esta ação é irreversível</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os seus projetos e dados serão removidos.
                  <br /><br />
                  Para confirmar, digite <strong>CONFIRMAR</strong> abaixo:
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="CONFIRMAR"
                className="mt-2"
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirm("")}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Excluir minha conta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
