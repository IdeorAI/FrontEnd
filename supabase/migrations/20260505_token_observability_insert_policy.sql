-- Spec 004 fix: Token Observability — INSERT policy + índice + provider tag
-- Garante que registros de ia_evaluations sejam aceitos mesmo se a auth de
-- service_role for resetada. Também acelera consultas do painel admin.

-- 1. INSERT policy — service_role bypassa RLS, mas damos defesa em profundidade
--    permitindo o próprio usuário registrar suas próprias avaliações
DROP POLICY IF EXISTS "Service inserts evaluations" ON public.ia_evaluations;
CREATE POLICY "Service inserts evaluations"
  ON public.ia_evaluations
  FOR INSERT
  WITH CHECK (
    user_id IS NULL
    OR auth.uid()::text = user_id
    OR auth.role() = 'service_role'
  );

-- 2. Índice por created_at para o painel admin (ordenação DESC)
CREATE INDEX IF NOT EXISTS idx_ia_evaluations_created_at
  ON public.ia_evaluations (created_at DESC);

-- 3. Índice por model_used para agregações ("tokens por provider")
CREATE INDEX IF NOT EXISTS idx_ia_evaluations_model_used
  ON public.ia_evaluations (model_used);
