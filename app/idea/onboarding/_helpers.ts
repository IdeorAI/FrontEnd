// app/idea/onboarding/_helpers.ts
// Spec 025 — helpers de UI do onboarding.

import type { User } from "@supabase/supabase-js";

/** Primeiro nome do usuário para a saudação do slide 1 (fallback amigável). */
export function firstNameOf(user: User | null): string {
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const full =
    (meta?.full_name as string) ||
    (meta?.name as string) ||
    (user?.email ? user.email.split("@")[0] : "");
  const first = (full || "").trim().split(/\s+/)[0];
  return first || "empreendedor";
}
