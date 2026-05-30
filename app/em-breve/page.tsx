import { Store, Trophy, CreditCard, MessageCircle, BarChart2, Mail, Users, Swords } from "lucide-react";
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

function ConvitesPreview() {
  const invites = [
    { initials: "JS", name: "João Silva", email: "joao@exemplo.com", role: "Editor" },
    { initials: "MR", name: "Maria Rocha", email: "maria@exemplo.com", role: "Visualizador" },
  ];
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground mb-3">Convites pendentes</p>
      {invites.map((i) => (
        <div
          key={i.initials}
          className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5"
        >
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
            {i.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{i.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {i.email} · {i.role}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              disabled
              className="text-[10px] px-2 py-1 rounded border border-primary/30 text-primary/50 opacity-60 cursor-not-allowed"
            >
              Aceitar
            </button>
            <button
              disabled
              className="text-[10px] px-2 py-1 rounded border border-border/50 text-muted-foreground opacity-60 cursor-not-allowed"
            >
              Recusar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AfiliadosPreview() {
  const top = [
    { name: "João Silva", invites: 42 },
    { name: "Você", invites: 27, mine: true },
    { name: "Ana Costa", invites: 19 },
  ];
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Top Embaixadores do Mês</p>
        <div className="space-y-1.5">
          {top.map((r) => (
            <div key={r.name} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs border ${r.mine ? "border-primary/40 bg-primary/5 font-semibold text-primary" : "border-border/50 bg-background/40"}`}>
              <span className="truncate">{r.name}</span>
              <span className="shrink-0 ml-2 text-muted-foreground font-mono">{r.invites} ativos</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border/50 bg-background/40 p-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Sua Evolução</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-primary font-semibold">🟣 Strategic Partner</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-4/5 rounded-full bg-primary/60" />
        </div>
        <p className="text-[10px] text-muted-foreground">Próximo: Conselho de Embaixadores</p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">24</p>
            <p className="text-[10px] text-muted-foreground">Indicados Ativos</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-primary">R$ 1.280</p>
            <p className="text-[10px] text-muted-foreground">Comissões</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesafiosPreview() {
  const contests = [
    { title: "Desafio Startup IA 2026", sub: "Inscrições até 30/09" },
    { title: "HealthTech Innovation Award", sub: "Prêmio: Mentoria + Créditos Cloud" },
    { title: "Future Founders Challenge", sub: "Prêmio: Programa de aceleração" },
  ];
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Concursos Abertos</p>
        <div className="space-y-1.5">
          {contests.map((c) => (
            <div key={c.title} className="rounded-lg border border-border/50 bg-background/40 px-3 py-2">
              <p className="text-xs font-medium">🏆 {c.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1.5">
        <p className="text-xs font-semibold text-primary">EduMind AI</p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Categoria: <span className="text-foreground font-medium">EdTech</span></span>
        </div>
        <p className="text-[10px] text-emerald-500 font-medium">✅ Elegível para 3 concursos</p>
        <button disabled className="mt-1 w-full text-[10px] py-1.5 rounded border border-primary/30 text-primary/60 opacity-70 cursor-not-allowed">
          Ver oportunidades
        </button>
      </div>
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
          IdeorAI - Próximas Versões
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Veja o que vem por aí
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
          description="Um diretório de mentores selecionados, prestadores de serviço, parceiros de tecnologia e investidores que você pode contratar ou fazer match de acordo com a fase e necessidades do seu projeto."
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
          name="Ranking de Melhores Projetos"
          tagline="Saiba como sua startup está posicionada."
          description="Ranking público (opcional) e dinâmico das melhores startups construídas na plataforma atraindo visibilidade, potenciais parceiros e até investidores."
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
          icon={Swords}
          name="Desafios & Concursos"
          tagline="Concursos internos e desafios que geram reconhecimento, apoio e crescimento."
          description="Uma área dedicada a desafios, editais e concursos promovidos pelo Ideor em parceria com empresas, aceleradoras, investidores, universidades e organizações do ecossistema de inovação. Os participantes poderão inscrever seus projetos e concorrer a premiações, mentorias, visibilidade, programas de aceleração e outros benefícios definidos por cada parceiro."
          bullets={[
            "Editais temáticos: participe de desafios voltados para setores específicos como IA, Saúde, Educação, Sustentabilidade, Fintech, Agrotech e outros.",
            "Inscrição simplificada: utilize as informações já geradas pelo Ideor para submeter seu projeto em poucos cliques.",
            "Avaliação estruturada: projetos analisados com base em critérios definidos por cada concurso.",
            "Premiações e incentivos: mentorias, créditos de tecnologia, aceleração, investimentos, serviços especializados e outras recompensas.",
            "Visibilidade para seu projeto: destaque para startups selecionadas e vencedoras dentro do ecossistema Ideor.",
          ]}
          preview={<DesafiosPreview />}
        />

        <FeatureSection
          icon={Users}
          name="Programa de Afiliados"
          tagline="Transforme sua rede em oportunidades e participe do crescimento do Ideor."
          description="Um programa criado para empreendedores, criadores de conteúdo, mentores e profissionais de inovação que desejam recomendar o Ideor e ser recompensados pelo crescimento da plataforma. Além das comissões por indicação, os participantes poderão evoluir dentro do ecossistema e conquistar benefícios exclusivos conforme sua contribuição."
          bullets={[
            "Link exclusivo: receba um link personalizado para convidar novos usuários.",
            "Comissões por indicação: ganhe recompensas quando usuários indicados assinarem planos pagos.",
            "Níveis de progressão: evolua de Afiliado para Embaixador conforme sua performance e retenção.",
            "Partner Pool: participe do fundo de embaixadores financiado por uma parcela dos lucros da plataforma.",
            "Reconhecimento e benefícios: desbloqueie badges, visibilidade, acesso antecipado a funcionalidades e oportunidades exclusivas.",
          ]}
          preview={<AfiliadosPreview />}
        />

        <FeatureSection
          icon={CreditCard}
          name="Planos Free e Pagos"
          tagline="De inscrição gratuita a planos flexíveis conforme o espírito do empreendedor."
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

        <FeatureSection
          icon={Mail}
          name="Convites para Equipe e Parceiros"
          tagline="A própria IA te ajuda a construir seu time e encontrar parcerias."
          description="Convide cofundadores, mentores e colaboradores para colaborar em projetos específicos. Cada pessoa convidada terá um papel (editor ou visualizador) com permissões granulares e poderá contribuir nas etapas que você liberar."
          bullets={[
            "Convites por email com aceite em 1-clique",
            "Papéis configuráveis: editor, visualizador, mentor",
            "Notificações em tempo real quando alguém entrar",
            "Histórico de quem mudou o quê em cada etapa",
            "Limite de assentos por projeto conforme o plano",
          ]}
          preview={<ConvitesPreview />}
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
