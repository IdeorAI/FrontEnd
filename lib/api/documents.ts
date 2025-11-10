// API client para geração de documentos
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface GenerateDocumentDto {
  phase: string;
  inputs: Record<string, string>;
}

export interface GenerateDocumentResponse {
  taskId: string;
  phase: string;
  generatedContent: string;
  modelUsed: string;
  tokensUsed: number;
  status: string;
}

export async function generateDocument(
  projectId: string,
  data: GenerateDocumentDto,
  userId: string
): Promise<GenerateDocumentResponse> {
  console.log('[generateDocument] Configuração:', {
    API_BASE,
    origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    envVars: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    }
  });

  console.log('[generateDocument] Chamando API:', {
    url: `${API_BASE}/api/projects/${projectId}/documents/generate`,
    projectId,
    phase: data.phase,
    userId,
    hasIdeia: !!data.inputs.ideia,
  });

  try {
    const res = await fetch(`${API_BASE}/api/projects/${projectId}/documents/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[generateDocument] Erro HTTP:', {
        status: res.status,
        statusText: res.statusText,
        errorBody: errorText,
      });
      throw new Error(`Failed to generate document: ${res.status} - ${errorText}`);
    }

    const result = await res.json();
    console.log('[generateDocument] Sucesso:', result);
    return result;
  } catch (error) {
    console.error('[generateDocument] Erro de rede/fetch:', {
      error,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      API_BASE,
    });
    throw error;
  }
}

export async function regenerateDocument(
  taskId: string,
  newInputs: Record<string, string>,
  userId: string
): Promise<GenerateDocumentResponse> {
  const res = await fetch(`${API_BASE}/api/documents/${taskId}/regenerate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify(newInputs),
  });

  if (!res.ok) throw new Error('Failed to regenerate document');
  return res.json();
}

export async function refineDocument(
  taskId: string,
  feedback: string,
  userId: string
): Promise<GenerateDocumentResponse> {
  const res = await fetch(`${API_BASE}/api/documents/${taskId}/refine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({ feedback }),
  });

  if (!res.ok) throw new Error('Failed to refine document');
  return res.json();
}
