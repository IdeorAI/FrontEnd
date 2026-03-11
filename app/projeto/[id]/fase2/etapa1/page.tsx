// app/projeto/[id]/fase2/etapa1/page.tsx (Server Component wrapper)
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Etapa1Client } from "./etapa1-client";

interface Etapa1PageProps {
  params: Promise<{ id: string }>;
}

export default async function Etapa1Page({ params }: Etapa1PageProps) {
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
