// lib/gemini-api.ts

export interface GenerateIdeasRequest {
  seedIdea: string;
  segmentDescription: string;
}

export interface GenerateIdeasResponse {
  ideas: string[];
}

export async function generateStartupIdeas(
  request: GenerateIdeasRequest
): Promise<GenerateIdeasResponse> {
  try {
    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    if (!backendBaseUrl) {
      throw new Error('BACKEND_URL não está configurada');
    }

    // URL direta do backend no Render - SEM proxy local
    const apiUrl = `${backendBaseUrl}/api/GeminiAI/suggest`;

    console.log('Chamando backend diretamente:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro do backend:', errorText);
      throw new Error(`Erro do servidor: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating ideas:', error);
    throw new Error('Falha ao gerar ideias: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
}
