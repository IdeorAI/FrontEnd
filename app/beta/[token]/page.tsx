import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Rocket, Zap, MessageSquareHeart, Target, Gift, AlertCircle } from "lucide-react";

export const metadata = { title: "Bem-vindo(a) à versão Beta do Ideor AI" };

// Sempre renderiza no servidor (valida o token a cada acesso)
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function BetaInvitePage({ params }: PageProps) {
  const { token } = await params;

  // Valida o token via RPC SECURITY DEFINER (RLS bloqueia leitura direta da
  // tabela pela anon key). A função só retorna o email se o token existir e
  // ainda não tiver sido usado.
  const supabase = await createClient();
  // RPC ainda não está tipada no database.types.ts — cast pontual.
  const { data } = await (supabase.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>
  ) => Promise<{ data: { email: string }[] | null }>)("lookup_beta_invite", {
    p_token: token,
  });

  const invite = data?.[0];

  // Token inexistente ou já consumido → 404.
  if (!invite?.email) {
    notFound();
  }

  const signUpHref = `/auth/sign-up?email=${encodeURIComponent(invite.email)}&invite=${token}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        {/* Hero */}
        <header className="space-y-5 text-center">
          <div className="flex justify-center">
            <Image
              src="/assets/logo_branco.png"
              alt="IdeorAI"
              width={140}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
            <Rocket className="h-3.5 w-3.5" />
            Versão Beta
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Bem-vindo(a) à versão Beta do Ideor AI
          </h1>
          <p className="text-lg font-medium text-foreground">
            Você foi selecionado(a)!
          </p>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Obrigado por participar desta fase exclusiva de testes.
          </p>
        </header>

        {/* Por que você está aqui */}
        <section className="rounded-xl border border-border/50 bg-background/40 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wide">
            Por que você está aqui
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O Ideor é uma plataforma que utiliza Inteligência Artificial para
            ajudar empreendedores a transformar ideias em startups estruturadas,
            apoiando etapas como validação, organização, documentação, avaliação
            da oportunidade e preparação para MVP.
          </p>
        </section>

        {/* O que é a versão Beta */}
        <section className="rounded-xl border border-border/50 bg-background/40 p-6 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wide">
            <Zap className="h-4 w-4" />
            O que é a versão Beta?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Você terá acesso antecipado à plataforma antes do lançamento
            oficial. Durante este período, algumas funcionalidades ainda poderão
            evoluir, ser ajustadas ou receber melhorias com base na experiência
            dos usuários. É você contribuindo para a melhoria do projeto!
          </p>
        </section>

        {/* Como você pode nos ajudar */}
        <section className="rounded-xl border border-border/50 bg-background/40 p-6 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wide">
            <MessageSquareHeart className="h-4 w-4" />
            Como você pode nos ajudar?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sua participação é fundamental para a construção da versão inicial do
            Ideor. Gostaríamos que você utilizasse a plataforma e compartilhasse
            conosco:
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {[
              "O que você gostou",
              "O que não funcionou bem",
              "O que está faltando",
              "Sugestões de melhoria",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Todo feedback será analisado pela equipe.
          </p>
        </section>

        {/* Nosso objetivo */}
        <section className="rounded-xl border border-border/50 bg-background/40 p-6 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wide">
            <Target className="h-4 w-4" />
            Nosso objetivo
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Queremos entender se o Ideor realmente ajuda empreendedores a
            transformar ideias em startups de forma mais rápida, organizada e
            eficiente. Sua opinião nos ajudará a construir uma plataforma melhor
            para todos.
          </p>
        </section>

        {/* Importante */}
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wide">
            <Gift className="h-4 w-4" />
            Importante
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Durante a fase beta, o acesso será gratuito para os participantes
            selecionados e todo o conteúdo e os materiais gerados poderão ser
            utilizados livremente em seus próprios projetos.
          </p>
        </section>

        {/* Aviso do email + CTA */}
        <section className="space-y-5 text-center">
          <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 p-4 text-left">
            <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use o mesmo email em que recebeu o convite
              {" "}
              (<span className="font-medium text-foreground">{invite.email}</span>).
              {" "}
              O beta só libera o cadastro para os emails da lista.
            </p>
          </div>

          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={signUpHref}>Criar minha conta beta</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
