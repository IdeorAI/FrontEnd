import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EtapaClient } from "./etapa-client";

export default async function EtapaPage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      redirect("/auth/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("seen_tooltips")
      .eq("id", user.id)
      .single();

    const seenTooltips: Record<string, boolean> = profile?.seen_tooltips ?? {};

    return <EtapaClient seenTooltips={seenTooltips} />;
  } catch (error) {
    console.error("[EtapaPage] Error:", error);
    // Fallback: renderizar sem tooltips
    return <EtapaClient seenTooltips={{}} />;
  }
}
