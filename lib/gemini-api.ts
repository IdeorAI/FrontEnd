// lib/gemini-api.ts
import { apiFetch } from './api-fetch'; // Importar o wrapper

export interface GenerateIdeasRequest {
  seedIdea: string;
  segmentDescription: string;
}

export interface GenerateIdeasResponse {
  ideas: string[];
  requestId?: string; // Adicione esta propriedade
}

export async function generateStartupIdeas(
  request: GenerateIdeasRequest
): Promise<GenerateIdeasResponse> {
  try {
    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendBaseUrl) {
      throw new Error("BACKEND_URL não está configurada");
    }

    // URL direta do backend no Render - SEM proxy local
    const apiUrl = `${backendBaseUrl}/api/GeminiAI/suggest`;

    console.log("Chamando backend diretamente:", apiUrl);

    // Usar apiFetch em vez de fetch nativo
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