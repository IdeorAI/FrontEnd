import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Acessar variáveis de ambiente de forma compatível com build de produção
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
  )!;

  // Debug detalhado (apenas em desenvolvimento)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[Supabase Client Debug]', {
      hasUrl: !!url,
      hasAnon: !!anon,
      urlValue: url,
      anonPrefix: anon?.substring(0, 20) + '...'
    });
  }

  if (!url || !anon) {
    const error = new Error(
      `Missing Supabase environment variables. ` +
      `URL: ${!!url} (${url}), ` +
      `Anon: ${!!anon}`
    );
    console.error(error);
    throw error;
  }

  try {
    const client = createBrowserClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // Mudado para true
        flowType: 'pkce', // Especificar explicitamente
      },
    });

    console.log('[Supabase Client] Created successfully');
    return client;
  } catch (error) {
    console.error('[Supabase Client] Failed to create:', error);
    throw error;
  }
}