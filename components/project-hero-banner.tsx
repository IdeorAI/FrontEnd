"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import categories from "@/lib/data/categories.json";
import { toast } from "sonner";

const MAX_NAME_LEN = 60;

/** Título do projeto no hero, com edição inline opcional (ícone de lápis). */
function EditableProjectTitle({
  projectName,
  onRename,
}: {
  projectName: string;
  onRename: (newName: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(projectName);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza o valor local quando o nome externo muda (ex.: recarregou o projeto).
  useEffect(() => {
    if (!editing) setValue(projectName);
  }, [projectName, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const cancel = () => {
    setValue(projectName);
    setEditing(false);
  };

  const save = async () => {
    const next = value.trim();
    if (!next) {
      toast.error("O nome do projeto não pode ficar vazio");
      return;
    }
    if (next === projectName) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onRename(next);
      setEditing(false);
    } catch {
      toast.error("Falha ao renomear o projeto");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={value}
          maxLength={MAX_NAME_LEN}
          disabled={saving}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void save();
            if (e.key === "Escape") cancel();
          }}
          aria-label="Nome do projeto"
          className="bg-white/15 text-white font-bold text-lg sm:text-xl md:text-2xl leading-tight rounded-md px-2 py-0.5 outline-none ring-2 ring-white/40 focus:ring-white/70 placeholder-white/50 min-w-0 w-full max-w-[18rem]"
        />
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          aria-label="Salvar nome"
          className="text-white/90 hover:text-white transition-colors disabled:opacity-50"
        >
          <Check className="h-5 w-5" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={saving}
          aria-label="Cancelar"
          className="text-white/70 hover:text-white transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h2 className="text-white font-bold text-lg sm:text-xl md:text-2xl leading-tight drop-shadow-lg truncate">
        {projectName}
      </h2>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Editar nome do projeto"
        title="Editar nome"
        className="shrink-0 text-white/70 hover:text-white transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Pencil className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}

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
  /** Se fornecido, o título vira editável (ícone de lápis). Persiste o novo nome. */
  onRename?: (newName: string) => Promise<void>;
}

export function ProjectHeroBanner({ projectName, category, createdAt, onRename }: ProjectHeroBannerProps) {
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 md:px-10">
        {onRename ? (
          <EditableProjectTitle projectName={projectName} onRename={onRename} />
        ) : (
          <h2 className="text-white font-bold text-lg sm:text-xl md:text-2xl leading-tight drop-shadow-lg truncate">
            {projectName}
          </h2>
        )}
        <div className="flex items-center mt-1.5 gap-2">
          {categoryLabel && (
            <span className="text-white/75 text-xs sm:text-sm font-medium truncate">{categoryLabel}</span>
          )}
          {createdAt && (
            <span className="ml-auto hidden sm:inline text-white/60 text-xs whitespace-nowrap">
              Criada em: {new Date(createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
