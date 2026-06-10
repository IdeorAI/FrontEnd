"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FinanceiroClient } from "./financeiro-client";
import { Loader2 } from "lucide-react";

export default function FinanceiroPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params?.id ?? "";
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>("Projeto");

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }
        if (projectId) {
          const { data } = await supabase
            .from("projects")
            .select("name")
            .eq("id", projectId)
            .single();
          if (data?.name) setProjectName(data.name as string);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <FinanceiroClient projectId={projectId} projectName={projectName} />;
}
