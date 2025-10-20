import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Função para sanitizar JWTs corrompidos pelo Vercel
function sanitizeEnvVar(value: string | undefined): string {
  if (!value) return '';
  // Remover TODOS os whitespaces (newlines, tabs, espaços)
  return value.replace(/[\s\n\r\t]/g, '');
}

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  // Sanitizar variáveis de ambiente antes de criar o cliente
  const url = sanitizeEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anon = sanitizeEnvVar(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
  );

  if (!url || !anon) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(url, anon, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
