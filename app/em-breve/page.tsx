import { Store, Trophy, CreditCard, MessageCircle, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FeatureSection } from "@/components/em-breve/feature-section";

export const metadata = { title: "Em breve · IdeorAI" };

// --- Preview mocks (inline) ---

function MarketplacePreview() {
  const mentors = [
    { initials: "MR", name: "Mentor / Operador", tags: ["SaaS B2B", "Vendas"] },
    { initials: "AL", name: "Advisor / Investidor", tags: ["Healthtech", "Operações"] },
    { initials: "TP", name: "Especialista / CTO", tags: ["Produto", "Engenharia"] },
  ];
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground mb-3">Sugestões para você</p>
      {mentors.map((m) => (
        <div
          key={m.initials}
          className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/40 px-3 py-2.5"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
            {m.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{m.name}</p>
            <div className="flex gap-1 mt-0.5 flex-wrap">
              {m.tags.map((t) => (
                <span key={t} className="text-[10px] text-muted-foreground border border-border/50 rounded px-1">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <button
            disabled
            className="text-[10px] px-2 py-1 rounded border border-primary/30 text-primary/50 opacity-60 cursor-not-allowed shrink-0"
          >
            Conversar
          </button>
        </div>
      ))}
    </div>
  );
}

function RankingPreview() {
  const rows = [
    { pos: 1, name: "Startup Alpha", ivo: 82, mine: false },
    { pos: 2, name: "Meu Projeto", ivo: 74, mine: true },
    { pos: 3, name: "Projeto Omega", ivo: 61, mine: false },
  ];
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground mb-3">Top projetos · Seu setor</p>
      {rows.map((r) => (
        <div
          key={r.pos}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${
            r.mine
              ? "border-primary/40 bg-primary/5"
              : "border-border/50 bg-background/40"
          }`}
        >
          <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">
            {r.pos}
          </span>
          <span className={`text-xs flex-1 truncate font-medium ${r.mine ? "text-primary" : ""}`}>
            {r.name}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${r.mine ? "bg-primary" : "bg-muted-foreground/40"}`}
                style={{ width: `${r.ivo}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground w-6 text-right">{r.ivo}</span>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-center gap-1.5 pt-1 opacity-50">
        <BarChart2 className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">Histórico de evolução em breve</span>
      </div>
    </div>
  );
}

function PlanosPreview() {
  const plans = [
    {
      name: "Free",
      price: "Grátis",
      bullets: ["5 gerações/mês", "Export PDF básico", "Suporte via docs"],
      highlight: false,
    },
    {
      name: "Pro",
      price: "R$ —",
      bullets: ["50 gerações/mês", "PDF + PPT pitch-ready", "Marketplace prioritário"],
      highlight: true,
    },
    {
      name: "Founder",
      price: "R$ —",
      bullets: ["Ilimitado", "Todos os formatos", "Mentoria mensal incluída"],
      highlight: false,
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {plans.map((p) => (
        <div
          key={p.name}
          className={`rounded-lg border px-2.5 py-3 flex flex-col gap-2 ${
            p.highlight
              ? "border-primary/40 bg-primary/5 ring-1 ring-primary/40"
              : "border-border/50 bg-background/40"
          }`}
        >
          <div>
            <p className={`text-xs font-semibold ${p.highlight ? "text-primary" : ""}`}>{p.name}</p>
            <p className="text-[11px] text-muted-foreground">{p.price}</p>
          </div>
          <ul className="space-y-1">
            {p.bullets.map((b) => (
              <li key={b} className="text-[10px] text-foreground/70 leading-snug">
                · {b}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// --- Page ---

export default function EmBrevePage() {
  return (
    <div className="max-w-5xl mx-auto py-10 space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest">
          Beta privada · Próximas releases
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          O que estamos construindo a seguir
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Cada funcionalidade abaixo foi desenhada para remover um bloqueio real na jornada do
          fundador. Acompanhe o que está por vir e nos diga o que faz mais sentido para você.
        </p>
      </header>

      {/* Feature sections */}
      <div className="space-y-8">
        <FeatureSection
          icon={Store}
          name="Marketplace"
          tagline="A rede de mentores, parceiros e investidores curada para a sua etapa."
          description="Um diretório curado de mentores, prestadores de serviço, parceiros de tecnologia e investidores que você pode contratar ou fazer match conforme o seu IVO Index e a etapa atual do projeto."
          bullets={[
            "Match inteligente: parceiros recomendados pela IA com base no seu setor, estágio e bloqueio atual.",
            "Catálogo curado: cada perfil passa por validação (cases, reviews públicos, autenticidade).",
            "1-clique para conversar: solicite mentoria, orçamento ou diligência sem sair do IdeorAI.",
            "Histórico no projeto: tudo que você conversou fica anotado ao lado da etapa relevante.",
            "Tarifas combinadas: preços e modelos transparentes (hora, escopo, success fee).",
          ]}
          preview={<MarketplacePreview />}
        />

        <FeatureSection
          icon={Trophy}
          name="Ranking"
          tagline="Veja como sua ideia se posiciona — e o que falta para subir."
          description="Ranking público (opcional) dos projetos por IVO Index e pelos pilares O-M-V-E-T-D. Compare-se com o mercado, ganhe visibilidade e desbloqueie conquistas conforme evolui."
          bullets={[
            "Top por setor: posição no seu nicho, não em listas genéricas.",
            "Decomposição por pilar: veja onde está acima/abaixo da média (Originalidade, Mercado, Viabilidade, etc.).",
            "Conquistas e badges: marcos por etapa concluída e por melhorias acionadas.",
            "Histórico de evolução: gráfico do seu IVO ao longo do tempo (atualizado a cada avaliação).",
            "Visibilidade opt-in: você decide se o projeto aparece publicamente ou só para você.",
          ]}
          preview={<RankingPreview />}
        />

        <FeatureSection
          icon={CreditCard}
          name="Planos"
          tagline="Mais tokens, exportações avançadas e suporte prioritário quando você precisa acelerar."
          description="Planos pagos opcionais para quem quer ultrapassar os limites da versão gratuita — mais geração de documentos por mês, exportações em formatos profissionais, e acesso direto à nossa equipe."
          bullets={[
            "Tokens estendidos: limite mensal de geração de etapas ~10x maior.",
            "Exportações premium: PDF formatado, PPT pitch-ready, planilhas de unit economics.",
            "Acesso ao Marketplace (Pro): visibilidade prioritária na lista de mentores.",
            "Suporte prioritário: canal direto com a equipe e mentoria mensal incluída no plano Founder.",
            "Sem fidelidade: pague mensal ou anual com desconto. Cancele quando quiser.",
          ]}
          preview={<PlanosPreview />}
        />
      </div>

      {/* Page footer CTA */}
      <div className="flex flex-col items-center gap-4 pt-4 border-t border-border/30 text-center">
        <p className="text-sm text-muted-foreground">
          Quer influenciar o que construímos a seguir?
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/contato" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Falar com o time
          </Link>
        </Button>
      </div>
    </div>
  );
}
