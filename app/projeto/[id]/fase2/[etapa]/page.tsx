import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EtapaClient } from "./etapa-client";

interface EtapaPageProps {
  params: Promise<{ id: string; etapa: string }>;
}

export default async function EtapaPage({ params: _params }: EtapaPageProps) {
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

  return <EtapaClient seenTooltips={seenTooltips} />;
}
