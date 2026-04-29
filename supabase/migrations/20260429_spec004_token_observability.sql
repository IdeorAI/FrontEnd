-- Spec 004: Token Observability
-- Executada em: 2026-04-29

-- 1. Garantir coluna is_admin na tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Criar tabela ia_evaluations se não existir
CREATE TABLE IF NOT EXISTS public.ia_evaluations (
  id          text        PRIMARY KEY,
  task_id     text        NOT NULL,
  user_id     text,
  input_text  text,
  output_json text,
  model_used  text,
  tokens_used integer,
  input_tokens  integer,
  output_tokens integer,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. RLS na tabela ia_evaluations
ALTER TABLE public.ia_evaluations ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas seus próprios registros
CREATE POLICY IF NOT EXISTS "Users see own evaluations"
  ON public.ia_evaluations
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Service role bypassa RLS automaticamente — nenhuma policy extra necessária

-- 4. Marcar o usuário admin (aryhauffe@gmail.com)
UPDATE public.profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'aryhauffe@gmail.com'
);
