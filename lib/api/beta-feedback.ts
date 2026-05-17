import { createClient } from "@/lib/supabase/client";

export interface BetaFeedbackInput {
  title: string;
  description: string;
}

export async function submitBetaFeedback(input: BetaFeedbackInput): Promise<void> {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Você precisa estar logado");

  const url_origem = typeof window !== "undefined" ? window.location.pathname : null;
  const user_agent = typeof navigator !== "undefined" ? navigator.userAgent : null;

  const { error } = await supabase.from("beta_feedback").insert({
    user_id: user.id,
    title: input.title.trim(),
    description: input.description.trim(),
    url_origem,
    user_agent,
  });

  if (error) throw new Error(error.message);
}
