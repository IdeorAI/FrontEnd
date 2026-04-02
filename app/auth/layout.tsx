// app/(auth)/layout.tsx
import type { ReactNode } from "react";
import Image from "next/image";
import heroBg from "@/app/assets/hero-bg1.jpg";

export default function AuthLayout({ children }: { children: ReactNode }) {
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

      {/* Overlay (um pouco mais forte em telas maiores) */}
      <div className="absolute inset-0 bg-black/20 md:bg-black/30" />

      {/* Conteúdo */}
      <div className="relative z-10 flex min-h-svh w-full items-center justify-center px-4 py-10 sm:px-6 md:p-10">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>
    </section>
  );
}
