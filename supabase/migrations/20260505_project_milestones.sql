-- Spec score: marcos individuais por projeto (Opção B)
-- Cada projeto pode acumular marcos únicos (entrevistas, MVP, validação, pivot, lançamento, etc.)
-- Score = Conclusão + Profundidade + IVO ponderado + Marcos × 4 (máx 5)

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  milestone_key text      NOT NULL,
  title       text        NOT NULL,
  description text,
  achieved_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_project_milestone_key UNIQUE (project_id, milestone_key)
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project
  ON public.project_milestones (project_id);

ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read milestones" ON public.project_milestones;
CREATE POLICY "Members read milestones"
  ON public.project_milestones
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_milestones.project_id
        AND (p.owner_id = auth.uid() OR p.is_public = true)
    )
    OR EXISTS (
      SELECT 1 FROM public.project_members m
      WHERE m.project_id = project_milestones.project_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owner writes milestones" ON public.project_milestones;
CREATE POLICY "Owner writes milestones"
  ON public.project_milestones
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_milestones.project_id
        AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_milestones.project_id
        AND p.owner_id = auth.uid()
    )
  );
