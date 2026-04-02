import { Bell, Palette, Lock } from "lucide-react";
import type { ComponentType } from "react";

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
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Personalize sua experiência no IdeorAI</p>
      </div>

      <SectionCard icon={Palette} title="Aparência" description="Tema e visual da interface">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm">Tema</span>
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Escuro (padrão)</span>
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
          <span className="text-xs text-muted-foreground">Contate o suporte</span>
        </div>
      </SectionCard>
    </div>
  );
}
