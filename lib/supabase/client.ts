import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton instance - criar apenas uma vez
let supabaseInstance: SupabaseClient | null = null;

export function createClient() {
  // Se já existe uma instância, retornar ela
  if (supabaseInstance) {
    console.log('[Supabase Client] Reusing existing instance');
    return supabaseInstance;
  }

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

  // Custom fetch com sanitização de headers
  const customFetch: typeof fetch = (input, init) => {
    try {
      console.log('[Supabase Custom Fetch] Called with:', {
        url: input.toString(),
        method: init?.method || 'GET',
        hasHeaders: !!init?.headers,
        headers: init?.headers,
      });

      // Limpar e validar headers
      if (init?.headers) {
        const cleanedHeaders: Record<string, string> = {};
        let hasInvalidHeaders = false;

        // Processar headers baseado no tipo
        const headers = init.headers;
        if (headers instanceof Headers) {
          headers.forEach((value, key) => {
            if (value === undefined || value === null || value === 'undefined' || value === 'null' || value === '') {
              console.error('[Supabase Custom Fetch] ❌ Invalid header removed:', { key, value });
              hasInvalidHeaders = true;
            } else {
              cleanedHeaders[key] = String(value);
            }
          });
        } else if (Array.isArray(headers)) {
          headers.forEach(([key, value]) => {
            if (value === undefined || value === null || value === 'undefined' || value === 'null' || value === '') {
              console.error('[Supabase Custom Fetch] ❌ Invalid header removed:', { key, value });
              hasInvalidHeaders = true;
            } else {
              cleanedHeaders[key] = String(value);
            }
          });
        } else if (typeof headers === 'object') {
          Object.entries(headers).forEach(([key, value]) => {
            if (value === undefined || value === null || value === 'undefined' || value === 'null' || value === '') {
              console.error('[Supabase Custom Fetch] ❌ Invalid header removed:', { key, value });
              hasInvalidHeaders = true;
            } else {
              cleanedHeaders[key] = String(value);
            }
          });
        }

        if (hasInvalidHeaders) {
          console.warn('[Supabase Custom Fetch] ⚠️ Cleaned headers:', cleanedHeaders);
          init = { ...init, headers: cleanedHeaders };
        }
      }

      console.log('[Supabase Custom Fetch] ✅ Calling fetch with:', {
        url: input.toString(),
        method: init?.method || 'GET',
        headers: init?.headers,
      });

      return fetch(input, init);
    } catch (error) {
      console.error('[Supabase Custom Fetch] 💥 Error:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        url: input.toString(),
      });
      throw error;
    }
  };

  try {
    // Criar cliente apenas uma vez (singleton)
    supabaseInstance = createSupabaseClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: customFetch,
      },
    });

    console.log('[Supabase Client] Created NEW instance (singleton)', {
      authUrl: `${url}/auth/v1`,
      usingCustomFetch: true,
    });
    return supabaseInstance;
  } catch (error) {
    console.error('[Supabase Client] Failed to create:', error);
    throw error;
  }
}