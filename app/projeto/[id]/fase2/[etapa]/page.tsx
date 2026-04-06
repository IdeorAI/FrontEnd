"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EtapaClient } from "./etapa-client";

export default function EtapaPage() {
  const router = useRouter();
  
  const [seenTooltips, setSeenTooltips] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/auth/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("seen_tooltips")
          .eq("id", user.id)
          .single();

        setSeenTooltips(profile?.seen_tooltips ?? {});
      } catch (error) {
        console.error("[EtapaPage] Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8c7dff]"></div>
      </div>
    );
  }

  return <EtapaClient seenTooltips={seenTooltips} />;
}