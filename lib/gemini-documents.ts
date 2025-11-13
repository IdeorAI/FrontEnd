// lib/gemini-documents.ts
// Geração de documentos via Gemini API DIRETAMENTE (frontend)
// Solução alternativa ao backend que está com problema 503

// ============================================
// RATE LIMITING (Segurança)
// ============================================
const lastGenerationByUser = new Map<string, number>();
const RATE_LIMIT_MS = 10000; // 10 segundos entre gerações por usuário

function checkRateLimit(userId: string): void {
  const lastTime = lastGenerationByUser.get(userId);
  if (lastTime && Date.now() - lastTime < RATE_LIMIT_MS) {
    const waitSeconds = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastTime)) / 1000);
    throw new Error(`Por favor, aguarde ${waitSeconds} segundos antes de gerar novamente.`);
  }
  lastGenerationByUser.set(userId, Date.now());
}

// ============================================
// INTERFACES
// ============================================
export interface GenerateDocumentRequest {
  ideia: string;
  userId: string;
  stage: string;
}

export interface GenerateDocumentResponse {
  content: string;
  tokensUsed: number;
  elapsedMs: number;
}

// ============================================
// PROMPTS MINI (Ultra-compactos)
// ============================================
const PROMPTS_MINI = {
  etapa1: (ideia: string) => `Analise esta startup: ${ideia}

Retorne JSON:
\`\`\`json
{
  "declaracao_problema": {
    "dor_central": "[dor em 1 frase]",
    "quem_sente": "[público]",
    "consequencias": ["[consequência 1]", "[consequência 2]"]
  },
  "mapa_mercado": {
    "segmentos_promissores": ["[segmento 1]", "[segmento 2]"],
    "alternativas_atuais": ["[alternativa 1]"],
    "diferenciais_potenciais": ["[diferencial 1]", "[diferencial 2]"]
  },
  "personas": [{
    "nome": "[Nome]",
    "perfil": "[descrição breve]",
    "dores": ["[dor 1]", "[dor 2]"]
  }],
  "proposta_valor_inicial": {
    "frase_valor": "[1 frase]",
    "diferenciais": ["[diferencial 1]", "[diferencial 2]"]
  }
}
\`\`\`

Retorne APENAS JSON válido.`,

  etapa2: (ideia: string) => `Análise de mercado para: ${ideia}

Retorne JSON:
\`\`\`json
{
  "dimensionamento_mercado": {
    "tam": { "valor": "[valor]", "descricao": "[mercado total]" },
    "sam": { "valor": "[valor]", "descricao": "[alcançável]" },
    "som": { "valor": "[valor]", "descricao": "[realizável 3 anos]" }
  },
  "analise_competitiva": {
    "concorrentes_diretos": [{
      "nome": "[Nome]",
      "proposta": "[proposta]",
      "preco": "[preço]",
      "forças": ["[força 1]"],
      "fraquezas": ["[fraqueza 1]"]
    }],
    "concorrentes_indiretos": ["[alternativa 1]"],
    "vantagens_competitivas": ["[vantagem 1]", "[vantagem 2]"]
  },
  "tendencias": [{
    "tendencia": "[nome]",
    "impacto": "alto",
    "descricao": "[breve]"
  }],
  "validacao_preco": {
    "faixa_preco_sugerida": "[R$ X - R$ Y]",
    "modelo_monetizacao": "[modelo]",
    "justificativa": "[breve]"
  }
}
\`\`\`

Retorne APENAS JSON válido.`,

  etapa3: (ideia: string) => `Proposta de valor para: ${ideia}

Retorne JSON:
\`\`\`json
{
  "value_proposition_canvas": {
    "customer_profile": {
      "customer_jobs": ["[job 1]", "[job 2]"],
      "pains": ["[dor 1]", "[dor 2]"],
      "gains": ["[ganho 1]", "[ganho 2]"]
    },
    "value_map": {
      "products_services": ["[produto 1]"],
      "pain_relievers": ["[alivia dor 1]"],
      "gain_creators": ["[cria ganho 1]"]
    }
  },
  "proposta_valor_final": {
    "headline": "[1 frase impactante]",
    "subheadline": "[2-3 frases]",
    "beneficios_chave": ["[benefício 1]", "[benefício 2]"],
    "diferenciais": ["[diferencial 1]", "[diferencial 2]"]
  },
  "posicionamento": {
    "para": "[público]",
    "que": "[necessidade]",
    "nosso_produto": "[categoria]",
    "diferente_de": "[concorrentes]",
    "porque": "[razão]"
  }
}
\`\`\`

Retorne APENAS JSON válido.`,

  etapa4: (ideia: string) => `Business Model Canvas para: ${ideia}

Retorne JSON:
\`\`\`json
{
  "business_model_canvas": {
    "segmentos_clientes": ["[segmento 1]", "[segmento 2]"],
    "proposta_valor": ["[proposta]"],
    "canais": ["[canal 1]", "[canal 2]"],
    "relacionamento_clientes": ["[tipo 1]"],
    "fluxos_receita": [{
      "tipo": "[modelo]",
      "valor": "[R$ X]",
      "frequencia": "mensal"
    }],
    "recursos_chave": ["[recurso 1]", "[recurso 2]"],
    "atividades_chave": ["[atividade 1]", "[atividade 2]"],
    "parcerias_chave": ["[parceiro 1]"],
    "estrutura_custos": [{
      "categoria": "[categoria]",
      "valor_estimado": "[R$ X/mês]",
      "tipo": "fixo"
    }]
  },
  "projecao_financeira_simplificada": {
    "ano_1": {
      "receita_mensal_media": "[R$ X]",
      "custos_mensais": "[R$ Y]",
      "margem_bruta": "[%]",
      "break_even_months": "[N]"
    },
    "premissas": ["[premissa 1]", "[premissa 2]"]
  }
}
\`\`\`

Retorne APENAS JSON válido.`,

  etapa5: (ideia: string) => `MVP para: ${ideia}

Retorne JSON:
\`\`\`json
{
  "definicao_mvp": {
    "core_features": ["[feature 1]", "[feature 2]", "[feature 3]"],
    "nice_to_have": ["[feature opcional 1]"],
    "justificativa": "[por que essas features]"
  },
  "roadmap_3_meses": [
    { "mes": 1, "objetivo": "[objetivo]", "entregas": ["[entrega 1]"] },
    { "mes": 2, "objetivo": "[objetivo]", "entregas": ["[entrega 1]"] },
    { "mes": 3, "objetivo": "[objetivo]", "entregas": ["[entrega 1]"] }
  ],
  "metricas_validacao": [
    { "metrica": "[nome]", "meta": "[valor]", "motivo": "[por que importante]" }
  ],
  "stack_tecnologica": {
    "frontend": "[tech]",
    "backend": "[tech]",
    "database": "[tech]",
    "infra": "[cloud provider]"
  },
  "custo_desenvolvimento": {
    "estimativa_total": "[R$ X]",
    "tempo_estimado": "[N meses]",
    "composicao": [{ "item": "[item]", "valor": "[R$ Y]" }]
  }
}
\`\`\`

Retorne APENAS JSON válido.`,

  etapa6: (ideia: string) => `Equipe para: ${ideia}

Retorne JSON:
\`\`\`json
{
  "estrutura_equipe": [
    {
      "cargo": "[cargo]",
      "responsabilidades": ["[resp 1]", "[resp 2]"],
      "skills_obrigatorias": ["[skill 1]"],
      "dedicacao": "full-time",
      "custo_mensal": "[R$ X]"
    }
  ],
  "custo_total_mensal": "[R$ Y]",
  "custo_total_6_meses": "[R$ Z]",
  "terceirizacao_vs_inhouse": [
    { "funcao": "[função]", "recomendacao": "terceirizar", "motivo": "[motivo]" }
  ],
  "plano_contratacao": [
    { "mes": 1, "contratar": "[cargo]", "prioridade": "alta" }
  ]
}
\`\`\`

Retorne APENAS JSON válido.`,

  etapa7: (ideia: string) => `Pitch Deck para: ${ideia}

Retorne JSON:
\`\`\`json
{
  "pitch_deck": {
    "slide_1_problema": "[1 frase: problema principal]",
    "slide_2_solucao": "[1 frase: solução]",
    "slide_3_mercado": "[TAM: R$ X | SAM: R$ Y]",
    "slide_4_produto": "[descrição curta do produto]",
    "slide_5_modelo_negocio": "[como ganha dinheiro]",
    "slide_6_tracao": "[métricas ou milestones]",
    "slide_7_competicao": "[principais concorrentes]",
    "slide_8_equipe": "[perfil dos fundadores]",
    "slide_9_financeiro": "[projeção 3 anos]",
    "slide_10_ask": "[quanto busca investir e para quê]"
  },
  "plano_executivo": {
    "visao": "[1 frase: onde quer chegar]",
    "missao": "[1 frase: propósito]",
    "objetivos_6_meses": ["[objetivo 1]", "[objetivo 2]"],
    "investimento_necessario": "[R$ X]",
    "uso_recursos": [{ "categoria": "[categoria]", "valor": "[R$ Y]", "percentual": "[%]" }]
  },
  "one_pager": {
    "elevator_pitch": "[2-3 frases: resumo completo da startup]",
    "diferencial_competitivo": "[1 frase: por que escolher você]",
    "ask": "[o que precisa agora]"
  }
}
\`\`\`

Retorne APENAS JSON válido.`
};

// ============================================
// FUNÇÃO PRINCIPAL: Chamar Gemini API
// ============================================
async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key do Gemini não configurada. Configure NEXT_PUBLIC_GEMINI_API_KEY no .env.local");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

  console.log("[gemini-documents] Chamando Gemini API...");
  console.log("[gemini-documents] Prompt length:", prompt.length, "chars");

  const startTime = Date.now();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 2048,
      }
    }),
  });

  const elapsedMs = Date.now() - startTime;

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[gemini-documents] Erro do Gemini:", response.status, errorText);
    throw new Error(`Gemini API retornou erro ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  console.log("[gemini-documents] ✅ Sucesso! Tempo:", elapsedMs, "ms");
  console.log("[gemini-documents] Resposta length:", generatedText.length, "chars");

  return generatedText;
}

// ============================================
// FUNÇÕES PÚBLICAS: Gerar por Etapa
// ============================================

export async function generateEtapa1(ideia: string, userId: string): Promise<GenerateDocumentResponse> {
  checkRateLimit(userId);
  const startTime = Date.now();
  const prompt = PROMPTS_MINI.etapa1(ideia);
  const content = await callGeminiAPI(prompt);
  return {
    content,
    tokensUsed: Math.ceil((prompt.length + content.length) / 4),
    elapsedMs: Date.now() - startTime
  };
}

export async function generateEtapa2(ideia: string, userId: string): Promise<GenerateDocumentResponse> {
  checkRateLimit(userId);
  const startTime = Date.now();
  const prompt = PROMPTS_MINI.etapa2(ideia);
  const content = await callGeminiAPI(prompt);
  return {
    content,
    tokensUsed: Math.ceil((prompt.length + content.length) / 4),
    elapsedMs: Date.now() - startTime
  };
}

export async function generateEtapa3(ideia: string, userId: string): Promise<GenerateDocumentResponse> {
  checkRateLimit(userId);
  const startTime = Date.now();
  const prompt = PROMPTS_MINI.etapa3(ideia);
  const content = await callGeminiAPI(prompt);
  return {
    content,
    tokensUsed: Math.ceil((prompt.length + content.length) / 4),
    elapsedMs: Date.now() - startTime
  };
}

export async function generateEtapa4(ideia: string, userId: string): Promise<GenerateDocumentResponse> {
  checkRateLimit(userId);
  const startTime = Date.now();
  const prompt = PROMPTS_MINI.etapa4(ideia);
  const content = await callGeminiAPI(prompt);
  return {
    content,
    tokensUsed: Math.ceil((prompt.length + content.length) / 4),
    elapsedMs: Date.now() - startTime
  };
}

export async function generateEtapa5(ideia: string, userId: string): Promise<GenerateDocumentResponse> {
  checkRateLimit(userId);
  const startTime = Date.now();
  const prompt = PROMPTS_MINI.etapa5(ideia);
  const content = await callGeminiAPI(prompt);
  return {
    content,
    tokensUsed: Math.ceil((prompt.length + content.length) / 4),
    elapsedMs: Date.now() - startTime
  };
}

export async function generateEtapa6(ideia: string, userId: string): Promise<GenerateDocumentResponse> {
  checkRateLimit(userId);
  const startTime = Date.now();
  const prompt = PROMPTS_MINI.etapa6(ideia);
  const content = await callGeminiAPI(prompt);
  return {
    content,
    tokensUsed: Math.ceil((prompt.length + content.length) / 4),
    elapsedMs: Date.now() - startTime
  };
}

export async function generateEtapa7(ideia: string, userId: string): Promise<GenerateDocumentResponse> {
  checkRateLimit(userId);
  const startTime = Date.now();
  const prompt = PROMPTS_MINI.etapa7(ideia);
  const content = await callGeminiAPI(prompt);
  return {
    content,
    tokensUsed: Math.ceil((prompt.length + content.length) / 4),
    elapsedMs: Date.now() - startTime
  };
}

// Função helper para mapear stage para função
export async function generateDocumentByStage(
  stage: string,
  ideia: string,
  userId: string
): Promise<GenerateDocumentResponse> {
  const stageMap: Record<string, (ideia: string, userId: string) => Promise<GenerateDocumentResponse>> = {
    etapa1: generateEtapa1,
    etapa2: generateEtapa2,
    etapa3: generateEtapa3,
    etapa4: generateEtapa4,
    etapa5: generateEtapa5,
    etapa6: generateEtapa6,
    etapa7: generateEtapa7,
  };

  const generator = stageMap[stage];
  if (!generator) {
    throw new Error(`Stage '${stage}' não reconhecido. Use etapa1 a etapa7.`);
  }

  return generator(ideia, userId);
}
