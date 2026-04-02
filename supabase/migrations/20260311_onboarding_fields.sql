-- Migração: campos de onboarding na tabela profiles
-- Executada em: 2026-03-11

-- Flag para saber se o usuário já completou o onboarding
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Respostas do Welcome Flow (3 perguntas)
-- Formato: { "has_idea": "sim_especifica" | "algumas_ideias" | "descobrindo",
--            "objetivo": "saber_valor" | "primeiros_clientes" | "pitch",
--            "socios": "solo" | "com_socios" }
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_answers jsonb;

-- Tooltips já vistos pelo usuário
-- Formato: { "ideia_descricao": true, "gerar_button": true, "veredito": true }
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS seen_tooltips jsonb NOT NULL DEFAULT '{}';
