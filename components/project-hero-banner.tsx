"use client";

import Image from "next/image";
import categories from "@/lib/data/categories.json";

export const HERO_MAP: Record<string, string> = {
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

export const DEFAULT_HERO = "/hero/default.webp";

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

interface ProjectAvatarProps {
  projectName: string;
  category?: string | null;
  size?: number;
}

export function ProjectAvatar({ projectName, category, size = 48 }: ProjectAvatarProps) {
  const heroSrc = (category && HERO_MAP[category]) ?? DEFAULT_HERO;
  const initials = getInitials(projectName);
  const fontSize = size >= 56 ? "text-base" : size >= 44 ? "text-sm" : "text-xs";

  return (
    <div
      className="relative rounded-full overflow-hidden shrink-0 ring-2 ring-border/60 shadow-sm"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroSrc})` }}
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-white font-bold ${fontSize} leading-none select-none drop-shadow`}>
          {initials}
        </span>
      </div>
    </div>
  );
}

interface ProjectHeroBannerProps {
  projectName: string;
  category?: string | null;
  createdAt?: string | null;
}

export function ProjectHeroBanner({ projectName, category, createdAt }: ProjectHeroBannerProps) {
  const heroSrc = (category && HERO_MAP[category]) ?? DEFAULT_HERO;
  const categoryLabel = category
    ? (categories.find((c: { value: string }) => c.value === category)?.label ?? category)
    : null;

  return (
    <div className="relative w-full h-24 md:h-32 overflow-hidden rounded-xl mb-6">
      <Image
        src={heroSrc}
        alt=""
        fill
        aria-hidden
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
        <h2 className="text-white font-bold text-xl md:text-2xl leading-tight drop-shadow-lg truncate">
          {projectName}
        </h2>
        <div className="flex items-center mt-1.5">
          {categoryLabel && (
            <span className="text-white/75 text-sm font-medium">{categoryLabel}</span>
          )}
          {createdAt && (
            <span className="ml-auto text-white/60 text-xs">
              {new Date(createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
