// app/idea/layout.tsx
import type { ReactNode } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import heroBg from "@/app/assets/hero-bg1.jpg";
import Logo from "@/app/assets/logo_branco.png";
import Link from "next/link";

export default async function IdeaLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  type UserMetadata = { full_name?: string } & Record<string, unknown>;
  const meta = (user?.user_metadata ?? {}) as UserMetadata;

  const userProps = {
    name: meta.full_name ?? user?.email ?? "User",
    email: user?.email ?? "",
  };

  return (
    <section className="relative min-h-svh overflow-hidden">
      {/* Background */}
      <Image
        src={heroBg}
        alt=""
        fill
        priority
        aria-hidden
        className="object-cover opacity-70"
        sizes="100vw"
      />
      {/* Overlay */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Header fixo */}
      <header
        className="fixed inset-x-0 top-0 z-[9999] border-b border-white/10"
        style={{ backgroundColor: "#202a31" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo (esquerda) */}
          <div className="flex items-center">
            <Link href="/dashboard" aria-label="Ir para o dashboard">
              <Image
                src={Logo}
                alt="Ideor.AI"
                width={202} // 176 * 1.15 ≈ 202
                height={61} // 53 * 1.15 ≈ 61
                className="h-13 w-auto sm:h-[52px] md:h-[55px]"
                priority
              />
            </Link>
          </div>

          {/* Ações (direita) */}
          <nav className="flex items-center gap-4 text-sm">
            <span className="hidden md:inline opacity-80">
              Olá, {userProps.name}
            </span>
            <LogoutButton />
          </nav>
        </div>
      </header>

      {/* Conteúdo (empurrado pra baixo do header) */}
      <div className="relative z-10 flex min-h-svh w-full items-center justify-center px-4 pb-10 pt-24 sm:px-6 md:pt-28">
        {children}
      </div>
    </section>
  );
}
