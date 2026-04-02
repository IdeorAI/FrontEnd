// Interceptar fetch global para debug e corrigir valores inválidos
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
      console.log('[Fetch Debug] Called with:', {
        url: input.toString(),
        method: init?.method || 'GET',
        hasHeaders: !!init?.headers,
        headersType: init?.headers ? typeof init.headers : 'undefined',
        headers: init?.headers,
      });

      // Limpar e validar headers antes de passar para fetch
      if (init?.headers) {
        const headers = init.headers;
        const cleanedHeaders: Record<string, string> = {};
        let hasInvalidHeaders = false;

        // Processar headers baseado no tipo
        if (headers instanceof Headers) {
          headers.forEach((value, key) => {
            if (value === undefined || value === null || value === 'undefined' || value === 'null' || value === '') {
              console.error('[Fetch Debug] ❌ Removing invalid header:', { key, value, type: typeof value });
              hasInvalidHeaders = true;
            } else {
              cleanedHeaders[key] = String(value);
            }
          });
        } else if (Array.isArray(headers)) {
          headers.forEach(([key, value]) => {
            if (value === undefined || value === null || value === 'undefined' || value === 'null' || value === '') {
              console.error('[Fetch Debug] ❌ Removing invalid header:', { key, value, type: typeof value });
              hasInvalidHeaders = true;
            } else {
              cleanedHeaders[key] = String(value);
            }
          });
        } else if (typeof headers === 'object') {
          Object.entries(headers).forEach(([key, value]) => {
            if (value === undefined || value === null || value === 'undefined' || value === 'null' || value === '') {
              console.error('[Fetch Debug] ❌ Removing invalid header:', { key, value, type: typeof value });
              hasInvalidHeaders = true;
            } else {
              cleanedHeaders[key] = String(value);
            }
          });
        }

        // Se encontrou headers inválidos, substituir pelo objeto limpo
        if (hasInvalidHeaders) {
          console.warn('[Fetch Debug] ⚠️ Invalid headers detected and removed. Cleaned headers:', cleanedHeaders);
          init = {
            ...init,
            headers: cleanedHeaders
          };
        }
      }

      // Validar e corrigir outros campos do RequestInit
      if (init) {
        // Remover campos undefined
        const cleanedInit: RequestInit = {};

        Object.entries(init).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Type-safe assignment sem usar 'any'
            (cleanedInit as Record<string, unknown>)[key] = value;
          } else {
            console.warn(`[Fetch Debug] ⚠️ Removing undefined field: ${key}`);
          }
        });

        console.log('[Fetch Debug] ✅ Calling fetch with cleaned init:', {
          url: input.toString(),
          method: cleanedInit.method || 'GET',
          headers: cleanedInit.headers,
        });

        return originalFetch.call(this, input, cleanedInit);
      }

      return originalFetch.call(this, input, init);
    } catch (error) {
      console.error('[Fetch Debug] 💥 Error during fetch:', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        url: input.toString(),
        init,
      });
      throw error;
    }
  };

  console.log('[Fetch Debug] ✅ Global fetch wrapper installed with header sanitization');
}
