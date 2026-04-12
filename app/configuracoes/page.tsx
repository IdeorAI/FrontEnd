"use client";

import { useState, useEffect } from "react";
import { Bell, Palette, Lock, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import type { ComponentType } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function SectionCard({ icon: Icon, title, description, children }: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Carregar preferência salva
      const { data: profile } = await supabase
        .from("profiles")
        .select("theme_preference")
        .eq("id", user.id)
        .single();

      if (profile?.theme_preference) {
        setTheme(profile.theme_preference);
      }
    };
    init();
  }, [setTheme]);

  const handleThemeChange = async (isDark: boolean) => {
    const newTheme = isDark ? "dark" : "light";
    setTheme(newTheme);

    if (!userId) return;
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ theme_preference: newTheme })
        .eq("id", userId);
      toast.success(`Tema ${isDark ? "escuro" : "claro"} ativado`);
    } catch {
      toast.error("Não foi possível salvar a preferência de tema.");
    }
  };

  const isDark = mounted ? theme === "dark" : false;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Personalize sua experiência no IdeorAI</p>
      </div>

      <SectionCard icon={Palette} title="Aparência" description="Tema e visual da interface">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
            <div>
              <span className="text-sm font-medium">Tema</span>
              <p className="text-xs text-muted-foreground">{mounted ? (isDark ? "Escuro" : "Claro") : "Carregando..."}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <button
              role="switch"
              aria-checked={isDark}
              disabled={!mounted}
              onClick={() => handleThemeChange(!isDark)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isDark ? "bg-primary" : "bg-input"} disabled:opacity-50`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-background shadow-md transform transition-transform ${isDark ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Bell} title="Notificações" description="Alertas e atualizações">
        <div className="space-y-3">
          {[
            "Novidades do IdeorAI",
            "Atualizações de projetos",
            "Dicas e tutoriais",
          ].map((label) => (
            <div key={label} className="flex items-center justify-between py-1">
              <span className="text-sm">{label}</span>
              <span className="text-xs text-muted-foreground">Em breve</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={Lock} title="Privacidade" description="Dados e segurança">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm">Política de Privacidade</span>
          <a href="mailto:contato@ideorai.com" className="text-xs text-primary hover:underline">
            Ver documento →
          </a>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm">Excluir conta</span>
          <a href="/perfil" className="text-xs text-destructive hover:underline">
            Ir para Perfil →
          </a>
        </div>
      </SectionCard>
    </div>
  );
}
