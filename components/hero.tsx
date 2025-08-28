// components/hero.tsx (Server Component)
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { StaticImageData } from "next/image";
import heroBg from "@/app/assets/hero-bg1.jpg";

export default function Hero() {
  const bg = heroBg as StaticImageData;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
        style={{ backgroundImage: `url(${bg.src})` }}
      />
      {/* Gradient Overlays for transparency blend */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl">
          Crie sua{" "}
          <span className="bg-gradient-hero bg-clip-text text-transparent drop-shadow-lg">
            Startup de sucesso
          </span>
          <br />
          com a ajuda da IA
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
          Transforme sua ideia em um unicórnio: Do zero ao investimento, mesmo
          sem saber por onde começar.
        </p>

        <div className="space-y-4">
          <Button
            size="lg"
            className="text-lg px-8 py-4 bg-gradient-hero hover:shadow-glow transition-all duration-300 transform hover:scale-105 text-white font-semibold shadow-2xl drop-shadow-lg"
            asChild
          >
            <Link href="/auth/sign-up">Criar minha Startup GRÁTIS</Link>
          </Button>

          <p className="text-sm text-muted-foreground drop-shadow-md">
            Conta GRATUITA. Sem cartão de crédito.
          </p>
        </div>
      </div>
    </section>
  );
}
