import { createClient } from '@/lib/supabase/client';

/**
 * Retorna headers de autenticação para chamadas à API do backend.
 *
 * Usa apenas `getSession()` (mais rápido — token local, sem round-trip ao servidor).
 *
 * Assinaturas suportadas:
 * - `authHeaders()` — deriva `x-user-id` da sessão ativa; inclui `Content-Type: application/json`.
 * - `authHeaders(extra)` — idem, mesclando headers extras (sobrescrevem defaults).
 * - `authHeaders(userId, extra?)` — usa o `userId` fornecido (compat com chamadas antigas).
 */
export async function authHeaders(
  userIdOrExtra?: string | Record<string, string>,
  maybeExtra?: Record<string, string>,
): Promise<Record<string, string>> {
  const explicitUserId = typeof userIdOrExtra === 'string' ? userIdOrExtra : undefined;
  const extra =
    typeof userIdOrExtra === 'object' && userIdOrExtra !== null
      ? userIdOrExtra
      : maybeExtra ?? {};

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra };

  const userId = explicitUserId ?? session?.user?.id;
  if (userId) headers['x-user-id'] = userId;
  if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

  return headers;
}
