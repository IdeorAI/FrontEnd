import { createClient } from '@/lib/supabase/client'

export async function refineSectionAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (user) {
    headers['x-user-id'] = user.id
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}
