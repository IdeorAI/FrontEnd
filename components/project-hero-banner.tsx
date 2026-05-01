"use client";

import Image from "next/image";

const HERO_MAP: Record<string, string> = {
  "software-ia-dados": "/hero/software-ia-dados.webp",
  "financas-seguros": "/hero/financas-seguros.webp",
  "saude-ciencias-vida": "/hero/saude-ciencias-vida.webp",
  "varejo-ecommerce-marketing": "/hero/varejo-ecommerce-marketing.webp",
  "industria-manufatura-iot": "/hero/industria-manufatura-iot.webp",
  "logistica-mobilidade-transporte": "/hero/logistica-mobilidade-transporte.webp",
  "energia-clima-sustentabilidade": "/hero/energia-clima-sustentabilidade.webp",
  "imoveis-construcao": "/hero/imoveis-construcao.webp",
  "educacao-rh": "/hero/educacao-rh.webp",
  "seguranca-infraestrutura-digital": "/hero/seguranca-infraestrutura-digital.webp",
  "governo-juridico-setor-publico": "/hero/governo-juridico-setor-publico.webp",
  "midia-entretenimento-criadores": "/hero/midia-entretenimento-criadores.webp",
};

const DEFAULT_HERO = "/hero/default.webp";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

interface ProjectHeroBannerProps {
  projectName: string;
  category?: string | null;
}

export function ProjectHeroBanner({ projectName, category }: ProjectHeroBannerProps) {
  const heroSrc = (category && HERO_MAP[category]) ?? DEFAULT_HERO;
  const initials = getInitials(projectName);
  const showName = projectName.length <= 25;

  return (
    <div className="relative w-full h-36 md:h-48 overflow-hidden rounded-xl mb-6">
      <Image
        src={heroSrc}
        alt=""
        fill
        aria-hidden
        className="object-cover"
        priority
        sizes="100vw"
      />
      {/* Gradiente overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
      {/* Texto */}
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
        <span className="text-white font-black text-5xl md:text-7xl leading-none tracking-tight drop-shadow-lg select-none">
          {initials}
        </span>
        {showName && (
          <span className="text-white/85 text-base md:text-xl font-semibold mt-1 drop-shadow">
            {projectName}
          </span>
        )}
      </div>
    </div>
  );
}
