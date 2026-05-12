import { createClient } from '@/lib/supabase/client';

/**
 * Retorna headers de autenticação para chamadas à API do backend.
 * Sempre inclui x-user-id. Adiciona Authorization: Bearer se houver sessão ativa.
 * getUser() verifica o token no servidor e auto-renova se expirado.
 */
export async function authHeaders(
  userId: string,
  extra?: Record<string, string>,
): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const headers: Record<string, string> = { 'x-user-id': userId, ...extra };
  if (user) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}
