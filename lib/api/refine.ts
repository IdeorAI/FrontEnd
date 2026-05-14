import { createClient } from '@/lib/supabase/client'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ''

export class RefineError extends Error {
  constructor(
    public readonly serverError: string,
    public readonly raw?: string,
  ) {
    super(serverError)
    this.name = 'RefineError'
  }
}

async function refineAuthHeaders(): Promise<Record<string, string>> {
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

export async function refineDocument(params: {
  projectId: string
  stageContent: string
  userFeedback: string
  stageName: string
}): Promise<Record<string, string>> {
  const headers = await refineAuthHeaders()

  const res = await fetch(`${BACKEND_URL}/api/chat/refine`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      projectId: params.projectId,
      stageContent: params.stageContent,
      userFeedback: params.userFeedback,
      stageName: params.stageName,
    }),
  })

  if (res.status === 422) {
    const body = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new RefineError(body.error ?? 'Erro no refinamento', body.raw)
  }

  if (res.status === 429) {
    throw new RefineError('Limite de mensagens por hora atingido. Tente novamente em instantes.')
  }

  if (!res.ok) {
    throw new RefineError(`Erro ${res.status} ao refinar documento`)
  }

  const data = await res.json()
  // ASP.NET Core serializa em camelCase por padrão
  return (data.changedSections ?? data.ChangedSections ?? {}) as Record<string, string>
}
