import Image from "next/image";
import Link from "next/link";
import ideorLogo from "../app/ideorLogo.png";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
     <nav className="w-full border-b border-b-foreground/10 h-16 bg-white">
        <div className="mx-auto h-full max-w-5xl flex items-center justify-between px-5">
          {/* Esquerda: Logo + Título */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={ideorLogo}
              alt="Logo Ideor.AI"
              className="h-13 w-24 "
              priority
            />
            {/* <span className="font-semibold text-lg">Ideor.AI</span> */}
          </Link>

          {/* Direita: botões Sign In e Sign Up */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
             className="px-4 py-2 rounded-xl border text-sm hover:bg-background transition"
              >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
             className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-background hover:text-foreground transition"
   >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Body */}
      <section className="flex-1 flex items-center justify-center px-5">
        <div className="max-w-3xl text-center flex flex-col items-center gap-6 py-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Traga suas idéias para o mundo e transforme elas em negócio!
          </h1>
          <p className="text-base sm:text-lg text-accent">
            Conheça o caminho e os segredos para criação da sua própria Startup.
          </p>
          <Link
            href="/auth/sign-up" // mesmo destino do botão "Sign Up"
            className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-foreground text-sm sm:text-base font-semibold hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Criar minha Startup GRÁTIS
          </Link>
        </div>
      </section>

      {/* Footer opcional */}
      <footer className="w-full border-t">
        <div className="mx-auto max-w-5xl px-5 py-6 text-center text-xs text-foreground/70">
          © {new Date().getFullYear()} Ideor.AI — Todos os direitos reservados.
        </div>
      </footer>
    </main>
  );
}
