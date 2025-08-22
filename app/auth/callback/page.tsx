"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
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
        router.replace(`/auth/login?error=${encodeURIComponent(error.message)}`);
        return;
      }
      router.replace("/protected"); // ajuste o destino
    };
    doExchange();
  }, [router, searchParams]);

  return <p>Conectando…</p>;
}
