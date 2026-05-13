'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateProjectScore(projectId: string, score: number): Promise<void> {
  const supabase = await createClient()
  await supabase.from('projects').update({ score }).eq('id', projectId)
}
