// Prompts resumidos para teste das etapas 2, 3 e 4
// Versões simplificadas dos prompts do arquivo "Workflow criacao dos projetos_startups.md"

export const SIMPLIFIED_PROMPTS = {
  etapa2: {
    title: "Pesquisa de Mercado",
    systemPrompt: `Você é um analista de mercado especializado em startups. Sua missão é conduzir a etapa de Pesquisa de Mercado, produzindo um relatório estruturado e prático.`,

    userPromptTemplate: (ideia: string) => `
Analise a seguinte ideia de negócio e forneça uma pesquisa de mercado inicial:

IDEIA: ${ideia}

Forneça um relatório com:

A) Panorama do mercado
   - Tamanho de mercado estimado (TAM, SAM, SOM)
   - Principais tendências

B) Principais players
   - Liste 3-5 players relevantes
   - Breve descrição de cada um (modelo de negócio, público-alvo, diferenciais)

C) Análise de oportunidade
   - Vácuos/diferenciais não atendidos pelos players atuais
   - 2-3 recomendações de posicionamento inicial

Responda em formato JSON com a seguinte estrutura:
{
  "tamanho_mercado": {
    "TAM": "string com valor estimado",
    "SAM": "string com valor estimado",
    "SOM": "string com valor estimado"
  },
  "tendencias": ["tendencia1", "tendencia2"],
  "players": [
    {
      "nome": "string",
      "descricao": "string",
      "modelo_negocio": "string",
      "diferenciais": "string"
    }
  ],
  "oportunidades": ["oportunidade1", "oportunidade2"],
  "recomendacoes": ["recomendacao1", "recomendacao2"]
}
`,
  },

  etapa3: {
    title: "Proposta de Valor",
    systemPrompt: `Você é um estrategista de produto aplicando Value Proposition Canvas e Jobs To Be Done (JTBD) para redigir a Proposta de Valor de uma startup em pré-seed.`,

    userPromptTemplate: (ideia: string) => `
Com base na seguinte ideia, crie uma Proposta de Valor clara e mensurável:

IDEIA: ${ideia}

Gere uma Proposta de Valor v1 composta por:

A) Frase de valor (1 sentença clara)
   Use o formato: "Ajudamos [quem] que [dor/necessidade] a [resultado/benefício] por meio de [como]"

B) Jobs-to-be-done, dores e ganhos atendidos (3 bullets)
   Formato: "Job: [verbo + objeto + contexto] — Dor: [...] — Ganho: [...]"

C) Diferenciais específicos (2-3 pontos)
   Compare com alternativas existentes no mercado

Responda em formato JSON com a seguinte estrutura:
{
  "frase_valor": "string com a frase de valor completa",
  "jobs": [
    {
      "job": "string com job-to-be-done",
      "dor": "string com dor aliviada",
      "ganho": "string com ganho habilitado"
    }
  ],
  "diferenciais": [
    {
      "vs_alternativa": "string com nome da alternativa",
      "limitacao_alternativa": "string",
      "nosso_diferencial": "string"
    }
  ]
}
`,
  },

  etapa4: {
    title: "Modelo de Negócio",
    systemPrompt: `Você é um estrategista de negócios na fase de modelagem de negócio. Sua missão é estruturar hipóteses de modelo de negócio utilizando Business Model Canvas.`,

    userPromptTemplate: (ideia: string) => `
Estruture um Modelo de Negócio inicial para a seguinte ideia:

IDEIA: ${ideia}

Crie um modelo de negócio simplificado incluindo:

A) Proposta de valor (descrição clara)

B) Segmentos de clientes
   - Quem são os clientes prioritários
   - Early adopters

C) Fontes de receita (2-3 opções)
   - Modelo de monetização sugerido (assinatura, freemium, marketplace, etc.)
   - Faixa de preço estimada

D) Canais de distribuição
   - Como chegar aos clientes
   - Canais de aquisição principais

E) Principais recursos necessários
   - Recursos-chave para operação

Responda em formato JSON com a seguinte estrutura:
{
  "proposta_valor": "string com descrição clara",
  "segmentos_clientes": {
    "prioritarios": ["segmento1", "segmento2"],
    "early_adopters": "string descrevendo perfil"
  },
  "fontes_receita": [
    {
      "modelo": "string (ex: assinatura, freemium)",
      "descricao": "string",
      "faixa_preco": "string"
    }
  ],
  "canais": {
    "distribuicao": ["canal1", "canal2"],
    "aquisicao": ["canal1", "canal2"]
  },
  "recursos_chave": ["recurso1", "recurso2", "recurso3"]
}
`,
  },
};

// Função auxiliar para obter o prompt completo de uma etapa
export function getSimplifiedPrompt(etapa: 'etapa2' | 'etapa3' | 'etapa4', ideia: string) {
  const prompt = SIMPLIFIED_PROMPTS[etapa];
  return {
    system: prompt.systemPrompt,
    user: prompt.userPromptTemplate(ideia),
    title: prompt.title,
  };
}
