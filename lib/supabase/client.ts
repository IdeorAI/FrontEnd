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

  // Custom fetch com sanitização completa de headers e RequestInit
  const customFetch: typeof fetch = (input, init) => {
    try {
      console.log('[Supabase Custom Fetch] 🔍 Original request:', {
        url: input.toString(),
        method: init?.method || 'GET',
        hasHeaders: !!init?.headers,
        headers: init?.headers,
        fullInit: init,
      });

      // Se não há init, fazer fetch normal
      if (!init) {
        return fetch(input);
      }

      // Criar objeto limpo do RequestInit
      const cleanedInit: RequestInit = {};

      // Limpar e validar headers - usar Headers object nativo
      if (init.headers) {
        const cleanedHeaders = new Headers();
        let hasInvalidHeaders = false;

        // Helper para validar e adicionar header com try-catch individual
        const safeSetHeader = (key: string, value: unknown) => {
          // Validações básicas
          if (value === undefined || value === null || value === 'undefined' || value === 'null' || value === '') {
            console.error('[Supabase Custom Fetch] ❌ Invalid header value (null/undefined/empty):', { key, value, type: typeof value });
            hasInvalidHeaders = true;
            return;
          }

          // Converter para string
          const stringValue = String(value);

          // Validar se a string resultante é válida
          if (stringValue === 'undefined' || stringValue === 'null' || stringValue.trim() === '') {
            console.error('[Supabase Custom Fetch] ❌ Invalid header value (string check):', { key, value, stringValue });
            hasInvalidHeaders = true;
            return;
          }

          // Tentar adicionar o header com try-catch
          try {
            cleanedHeaders.set(key, stringValue);
            console.log(`[Supabase Custom Fetch] ✅ Header added: ${key} = ${stringValue.substring(0, 50)}...`);
          } catch (error) {
            console.error('[Supabase Custom Fetch] 💥 Failed to set header:', {
              key,
              value,
              stringValue,
              stringValueLength: stringValue.length,
              error: error instanceof Error ? error.message : String(error),
              charCodes: Array.from(stringValue.substring(0, 100)).map(c => c.charCodeAt(0)),
            });
            hasInvalidHeaders = true;
          }
        };

        // Processar headers baseado no tipo
        const headers = init.headers;
        if (headers instanceof Headers) {
          headers.forEach((value, key) => {
            safeSetHeader(key, value);
          });
        } else if (Array.isArray(headers)) {
          headers.forEach(([key, value]) => {
            safeSetHeader(key, value);
          });
        } else if (typeof headers === 'object') {
          Object.entries(headers).forEach(([key, value]) => {
            safeSetHeader(key, value);
          });
        }

        if (hasInvalidHeaders) {
          console.warn('[Supabase Custom Fetch] ⚠️ Some headers were skipped due to invalid values');
        }
        cleanedInit.headers = cleanedHeaders;
      }

      // Copiar outros campos válidos do RequestInit, apenas se existem
      if (init.method !== undefined && init.method !== null) {
        cleanedInit.method = init.method;
      }
      if (init.body !== undefined && init.body !== null) {
        cleanedInit.body = init.body;
      }
      if (init.mode !== undefined && init.mode !== null) {
        cleanedInit.mode = init.mode;
      }
      if (init.credentials !== undefined && init.credentials !== null) {
        cleanedInit.credentials = init.credentials;
      }
      if (init.cache !== undefined && init.cache !== null) {
        cleanedInit.cache = init.cache;
      }
      if (init.redirect !== undefined && init.redirect !== null) {
        cleanedInit.redirect = init.redirect;
      }
      if (init.referrer !== undefined && init.referrer !== null) {
        cleanedInit.referrer = init.referrer;
      }
      if (init.referrerPolicy !== undefined && init.referrerPolicy !== null) {
        cleanedInit.referrerPolicy = init.referrerPolicy;
      }
      if (init.integrity !== undefined && init.integrity !== null) {
        cleanedInit.integrity = init.integrity;
      }
      if (init.keepalive !== undefined && init.keepalive !== null) {
        cleanedInit.keepalive = init.keepalive;
      }
      if (init.signal !== undefined && init.signal !== null) {
        cleanedInit.signal = init.signal;
      }

      console.log('[Supabase Custom Fetch] ✅ Calling fetch with cleaned init:', {
        url: input.toString(),
        method: cleanedInit.method,
        hasBody: !!cleanedInit.body,
        hasHeaders: !!cleanedInit.headers,
        headersCount: cleanedInit.headers ? Object.keys(cleanedInit.headers).length : 0,
        allKeys: Object.keys(cleanedInit),
        fullCleanedInit: JSON.stringify(cleanedInit, null, 2),
      });

      return fetch(input, cleanedInit);
    } catch (error) {
      console.error('[Supabase Custom Fetch] 💥 Error:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: input.toString(),
        originalInit: init,
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