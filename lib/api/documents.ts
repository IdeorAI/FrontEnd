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
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/documents/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to generate document');
  return res.json();
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
