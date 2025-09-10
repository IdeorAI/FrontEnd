// lib/gemini-api.ts
const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function generateStartupIdeas(
  request: GenerateIdeasRequest
): Promise<GenerateIdeasResponse> {
  try {
    // URL direta do backend - SEM proxy em produção
    const apiUrl = `${backendBaseUrl}/api/GeminiAI/suggest`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating ideas:', error);
    throw new Error('Failed to generate startup ideas');
  }
}