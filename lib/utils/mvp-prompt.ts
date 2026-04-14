/**
 * Gera um prompt formatado para ferramentas NoCode (Lovable, Bolt, v0)
 * a partir do conteúdo da Etapa 5 (MVP) do projeto.
 */

function extractFeatures(content: string): string[] {
  const lines = content.split("\n");
  const featureKeywords = /funcionalidade|feature|módulo|tela|página|botão|cadastro|login|dashboard|relatório|notificação|integração|api|upload|busca|filtro|listagem/i;
  const bulletPattern = /^\s*[-•*]\s+(.+)$/;
  const numberedPattern = /^\s*\d+[.)]\s+(.+)$/;

  const features: string[] = [];

  for (const line of lines) {
    const bulletMatch = line.match(bulletPattern);
    const numberedMatch = line.match(numberedPattern);
    const matched = bulletMatch?.[1] || numberedMatch?.[1];

    if (matched && matched.length > 10) {
      features.push(matched.trim());
      if (features.length >= 5) break;
    }
  }

  // fallback: linhas com palavras-chave de funcionalidade
  if (features.length === 0) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 20 && featureKeywords.test(trimmed)) {
        features.push(trimmed);
        if (features.length >= 5) break;
      }
    }
  }

  return features;
}

export function generateMvpPrompt(
  projectName: string,
  category: string | null,
  stage5Content: string
): string {
  const tipo = category || "SaaS web app";
  const features = extractFeatures(stage5Content);

  const featureLines =
    features.length > 0
      ? features.map((f) => `- ${f}`).join("\n")
      : "- Interface intuitiva e responsiva\n- Cadastro e autenticação de usuários\n- Dashboard com as principais métricas";

  return `Crie um aplicativo web chamado "${projectName}".

Tipo: ${tipo}

Funcionalidades principais:
${featureLines}

Requisitos técnicos:
- Interface web responsiva
- Design moderno e minimalista
- Foco em simplicidade e usabilidade

Comece com a tela principal/dashboard e as 3 funcionalidades mais importantes.`;
}
