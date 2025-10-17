import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Acessar variáveis de ambiente de forma compatível com build de produção
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
  );

  // Debug detalhado sempre em produção para diagnosticar
  if (typeof window !== 'undefined') {
    console.log('[Supabase Client Debug]', {
      hasUrl: !!url,
      hasAnon: !!anon,
      urlValue: url,
      urlType: typeof url,
      urlLength: url?.length,
      anonPrefix: anon?.substring(0, 20) + '...',
      anonType: typeof anon,
      anonLength: anon?.length,
    });
  }

  // Validação rigorosa
  if (!url || typeof url !== 'string' || url.trim() === '') {
    const error = new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL: ${JSON.stringify(url)}`
    );
    console.error(error);
    throw error;
  }

  if (!anon || typeof anon !== 'string' || anon.trim() === '') {
    const error = new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY: ${JSON.stringify(anon)}`
    );
    console.error(error);
    throw error;
  }

  // Validar formato da URL
  try {
    new URL(url);
  } catch {
    const error = new Error(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid URL: ${url}`
    );
    console.error(error);
    throw error;
  }

  try {
    const client = createBrowserClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase-auth-token',
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web',
          'apikey': anon,
        },
        fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
          // Criar headers de forma segura, filtrando valores undefined/null
          const headers = new Headers();

          // Copiar headers existentes se houver
          if (options.headers) {
            const existingHeaders = new Headers(options.headers);
            existingHeaders.forEach((value, key) => {
              if (value !== undefined && value !== null && value !== 'undefined') {
                headers.set(key, value);
              }
            });
          }

          // Garantir headers essenciais
          if (!headers.has('apikey')) {
            headers.set('apikey', anon);
          }
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${anon}`);
          }

          console.log('[Supabase Fetch]', {
            url: url.toString(),
            method: options.method || 'GET',
            hasApiKey: headers.has('apikey'),
            hasAuth: headers.has('Authorization'),
            headerCount: Array.from(headers.keys()).length,
          });

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    });

    console.log('[Supabase Client] Created successfully', {
      authUrl: `${url}/auth/v1`,
    });
    return client;
  } catch (error) {
    console.error('[Supabase Client] Failed to create:', error);
    throw error;
  }
}