// Interceptar fetch global para debug
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

      // Validar headers antes de passar para fetch
      if (init?.headers) {
        const headers = init.headers;

        // Se for um objeto HeadersInit
        if (headers instanceof Headers) {
          headers.forEach((value, key) => {
            if (value === undefined || value === null || value === 'undefined') {
              console.error('[Fetch Debug] Invalid header value:', { key, value });
            }
          });
        } else if (Array.isArray(headers)) {
          headers.forEach(([key, value]) => {
            if (value === undefined || value === null || value === 'undefined') {
              console.error('[Fetch Debug] Invalid header value:', { key, value });
            }
          });
        } else if (typeof headers === 'object') {
          Object.entries(headers).forEach(([key, value]) => {
            if (value === undefined || value === null || value === 'undefined') {
              console.error('[Fetch Debug] Invalid header value:', { key, value });
            }
          });
        }
      }

      return originalFetch.call(this, input, init);
    } catch (error) {
      console.error('[Fetch Debug] Error:', error);
      throw error;
    }
  };

  console.log('[Fetch Debug] Global fetch wrapper installed');
}
