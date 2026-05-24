import { Store, Trophy, CreditCard } from "lucide-react";
import { MockupCard } from "@/components/em-breve/mockup-card";

export const metadata = { title: "Em breve · IdeorAI" };

export default function EmBrevePage() {
  return (
    <div className="container max-w-5xl py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Em breve no IdeorAI</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Estamos construindo recursos que vão amplificar o que você já cria com o IdeorAI.
          Veja o que está vindo nas próximas releases.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MockupCard
          icon={Store}
          title="Marketplace"
          description="Conecte-se com mentores, parceiros e investidores certos para a etapa do seu projeto."
          highlights={[
            "Curadoria por estágio e setor",
            "Match com fundadores e operadores",
            "Pedidos de mentoria com 1-clique",
          ]}
        />
        <MockupCard
          icon={Trophy}
          title="Ranking"
          description="Acompanhe seu IVO Index frente a outros projetos e ganhe visibilidade."
          highlights={[
            "Top projetos por setor",
            "Conquistas e badges por etapa",
            "Histórico de evolução do score",
          ]}
        />
        <MockupCard
          icon={CreditCard}
          title="Planos"
          description="Mais limites, novos relatórios e acesso a parceiros premium."
          highlights={[
            "Tokens estendidos por mês",
            "Exportações avançadas (PDF/PPT)",
            "Suporte prioritário",
          ]}
        />
      </section>
    </div>
  );
}
