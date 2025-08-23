"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p>Conectando…</p>}>
      <AuthCallbackInner />
    </Suspense>
  );
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const doExchange = async () => {
      const code = searchParams.get("code");
      if (!code) {
        router.replace("/auth/login?error=missing_code");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        router.replace(
          `/auth/login?error=${encodeURIComponent(error.message)}`
        );
        return;
      }

      // ajuste o destino conforme sua app
      router.replace("/dashboard");
    };

    doExchange();
  }, [router, searchParams]);

  // O conteúdo real fica no fallback do Suspense; aqui não renderizamos nada
  return null;
}
