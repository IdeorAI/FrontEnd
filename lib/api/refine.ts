import { authHeaders } from '@/lib/api/auth-headers'

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

export async function refineDocument(params: {
  projectId: string
  stageContent: string
  userFeedback: string
  stageName: string
}): Promise<Record<string, string>> {
  const headers = await authHeaders()

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
