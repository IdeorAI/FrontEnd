// lib/gemini-api.ts
import { apiFetch } from './api-fetch'; // Importar o wrapper

export interface GenerateIdeasRequest {
  seedIdea: string;
  segmentDescription: string;
  count?: number;
  projectId?: string;
  ownerId?: string;
  category?: string;
}

export interface SuggestAndSaveRequest {
  ownerId: string;
  projectId?: string;
  segmentDescription: string;
  count?: number;
  seedIdea?: string;
}

export interface GenerateIdeasResponse {
  ideas: string[];
  requestId?: string;
}

export async function suggestAndSaveIdeas(
  request: SuggestAndSaveRequest
): Promise<GenerateIdeasResponse> {
  try {
    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendBaseUrl) {
      throw new Error("BACKEND_URL não está configurada");
    }

    const apiUrl = `${backendBaseUrl}/api/BusinessIdeas/suggest-and-save`;

    console.log("Chamando suggest-and-save:", apiUrl, request);

    const response = await apiFetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let detail = "";
      try {
        const parsed = JSON.parse(errorText);
        detail = parsed?.detail || parsed?.error || "";
      } catch {
        detail = errorText;
      }

      const requestId = response.headers.get("x-request-id");
      console.error("Erro do backend suggest-and-save:", errorText, "Request ID:", requestId);

      throw new Error(
        `Erro do servidor ${response.status}${detail ? `: ${detail}` : ""}`
      );
    }

    const data = await response.json();
    const requestId = response.headers.get("x-request-id");
    return { ...data, requestId };
  } catch (error) {
    console.error("Error in suggestAndSaveIdeas:", error);
    throw new Error(
      "Falha ao gerar e salvar ideias: " +
        (error instanceof Error ? error.message : "Erro desconhecido")
    );
  }
}

export async function generateStartupIdeas(
  request: GenerateIdeasRequest & { count?: number }
): Promise<GenerateIdeasResponse> {
  try {
    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendBaseUrl) {
      throw new Error("BACKEND_URL não está configurada");
    }

    // URL direta do backend no Render - SEM proxy local
    const apiUrl = `${backendBaseUrl}/api/BusinessIdeas/suggest-by-segment`;

    console.log("Chamando backend diretamente:", apiUrl);

    // Transformar camelCase para PascalCase conforme esperado pelo backend C#
    const backendRequest = {
      SegmentDescription: request.segmentDescription,
      Count: request.count,
      ProjectId: request.projectId,
      OwnerId: request.ownerId,
      Category: request.category,
    };

    console.log("Payload enviado:", backendRequest);

    // Usar apiFetch em vez de fetch nativo
    const response = await apiFetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let detail = "";
      try {
        const parsed = JSON.parse(errorText);
        detail = parsed?.detail || parsed?.error || "";
      } catch {
        detail = errorText;
      }
      
      // Capturar request ID do header se disponível
      const requestId = response.headers.get("x-request-id");
      console.error("Erro do backend:", errorText, "Request ID:", requestId);
      
      throw new Error(
        `Erro do servidor ${response.status}${detail ? `: ${detail}` : ""}`
      );
    }

    const data = await response.json();
    
    // Adicionar request ID à resposta
    const requestId = response.headers.get("x-request-id");
    return { ...data, requestId };
  } catch (error) {
    console.error("Error generating ideas:", error);
    throw new Error(
      "Falha ao gerar ideias: " +
        (error instanceof Error ? error.message : "Erro desconhecido")
    );
  }
}