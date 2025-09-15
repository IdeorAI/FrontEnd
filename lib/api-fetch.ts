// api-fetch.ts
interface Sentry {
  captureException(error: unknown, options?: { tags?: Record<string, string> }): void;
}

interface WindowWithSentry extends Window {
  Sentry?: Sentry;
}

declare const window: WindowWithSentry;

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const rid = (typeof window !== 'undefined' && window.crypto) 
    ? crypto.randomUUID() 
    : `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Armazena o requestId para uso no Sentry
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentRequestId', rid);
  }

  const headers = new Headers(init.headers);
  headers.set('x-request-id', rid);

  try {
    const response = await fetch(input, {
      ...init,
      headers,
    });

    if (!response.ok) {
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.captureException(new Error(`API Error: ${response.status}`), {
          tags: { request_id: rid, url: input.toString() },
        });
      }
    }

    return response;
  } catch (error: unknown) {
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { request_id: rid, url: input.toString() },
      });
    }
    throw error;
  } finally {
    // Limpa o requestId após a requisição
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentRequestId');
    }
  }
}