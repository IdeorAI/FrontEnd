import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Etapa1Client } from "./etapa1-client";

export default async function Etapa1Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("seen_tooltips")
    .eq("id", user.id)
    .single();

  const seenTooltips: Record<string, boolean> = profile?.seen_tooltips ?? {};

  return <Etapa1Client seenTooltips={seenTooltips} />;
}
