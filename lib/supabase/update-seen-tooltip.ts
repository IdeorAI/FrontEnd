// lib/supabase/update-seen-tooltip.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function markTooltipSeen(tooltipKey: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Usa o operador jsonb || do Postgres para fazer merge sem sobrescrever outros tooltips
  await supabase.rpc("merge_seen_tooltip", {
    user_id: user.id,
    tooltip_key: tooltipKey,
  });
}
