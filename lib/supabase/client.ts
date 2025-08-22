import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient(url, anon, {
    auth: {
      // mantém sessão no localStorage (necessário pro PKCE code_verifier)
      persistSession: true,
      autoRefreshToken: true,
      // vamos nós mesmos tratar o code no /auth/callback
      detectSessionInUrl: false,
    },
  });
}