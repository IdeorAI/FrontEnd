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

      // Melhorar mensagem de erro baseada no status code
      let userFriendlyMessage = '';

      if (res.status === 503 || errorText.includes('ServiceUnavailable') || errorText.includes('indisponível')) {
        userFriendlyMessage = 'A API de IA está temporariamente indisponível. O sistema tentou 3 vezes automaticamente, mas não obteve sucesso. Por favor, aguarde alguns instantes e tente novamente.';
      } else if (res.status === 429) {
        userFriendlyMessage = 'Limite de requisições atingido. Por favor, aguarde alguns instantes e tente novamente.';
      } else if (res.status === 400) {
        userFriendlyMessage = 'Erro na solicitação. Verifique se o projeto e os dados estão corretos.';
      } else if (res.status === 404) {
        userFriendlyMessage = 'Projeto não encontrado. Verifique se você tem acesso ao projeto.';
      } else if (res.status >= 500) {
        userFriendlyMessage = 'Erro no servidor. Por favor, tente novamente em alguns instantes.';
      } else {
        userFriendlyMessage = `Erro ao gerar documento (${res.status}). Tente novamente.`;
      }

      throw new Error(userFriendlyMessage);
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

    // Se já é um erro tratado, repassar
    if (error instanceof Error && error.message.includes('API de IA')) {
      throw error;
    }

    // Erro de rede/fetch genérico
    throw new Error('Problema de conexão com o servidor. Verifique sua internet e tente novamente.');
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
