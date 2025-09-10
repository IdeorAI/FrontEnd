// lib/gemini-api.ts
const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function generateStartupIdeas(
  request: GenerateIdeasRequest
): Promise<GenerateIdeasResponse> {
  try {
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
      throw new Error(`HTTP error! status: ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating ideas:', error);
    throw new Error('Failed to generate startup ideas: ' + error.message);
  }
}