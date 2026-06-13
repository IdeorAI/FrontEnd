// lib/manual-stage-configs.ts
// Spec 024 — subitens de cada etapa no modo manual (Colaborativo).
// Cada subitem vira um textarea de TEXTO LIVRE com placeholder explicativo.
// As chaves espelham o schema do fluxo IA (PromptTemplates.cs); no manual o
// valor é prosa do usuário (não a estrutura aninhada da IA).
// A chave `dre` da etapa 4 NÃO entra aqui — a DRE é o Resumo Financeiro (Spec 022).

export interface ManualSubitem {
  key: string;
  label: string;
  placeholder: string;
}

export interface ManualStageConfig {
  title: string;
  description: string;
  subitems: ManualSubitem[];
}

export const MANUAL_STAGE_CONFIGS: Record<string, ManualStageConfig> = {
  etapa1: {
    title: "Problema e Oportunidade",
    description:
      "Descreva o problema que sua startup resolve e para quem. Escreva com suas palavras — o Ideor pode ajudar em cada campo.",
    subitems: [
      {
        key: "declaracao_problema",
        label: "Declaração do problema",
        placeholder:
          "Qual é a dor central que você resolve? Descreva o problema de forma clara: quem sofre com ele, em que situação, e por que as soluções atuais não bastam.",
      },
      {
        key: "mapa_mercado",
        label: "Mapa do mercado",
        placeholder:
          "Como é o mercado onde você vai atuar? Tamanho aproximado, tendências relevantes e o contexto que torna esta uma boa oportunidade agora.",
      },
      {
        key: "personas",
        label: "Personas",
        placeholder:
          "Quem são seus clientes ideais? Descreva 1-3 perfis: quem são, o que precisam, e como o problema os afeta no dia a dia.",
      },
      {
        key: "proposta_valor_inicial",
        label: "Proposta de valor inicial",
        placeholder:
          "Em uma frase: o que você entrega, para quem, e qual benefício principal? (Esta é uma versão inicial — será refinada na etapa de Proposta de Valor.)",
      },
      {
        key: "resumo_ideia",
        label: "Resumo da ideia",
        placeholder:
          "Resuma sua ideia em poucas linhas: o público prioritário, a hipótese principal e como você imagina monetizar.",
      },
    ],
  },
  etapa2: {
    title: "Pesquisa de Mercado",
    description:
      "Mapeie concorrentes, lacunas e o posicionamento da sua startup no mercado.",
    subitems: [
      {
        key: "competidores_alternativas",
        label: "Competidores e alternativas",
        placeholder:
          "Quem já resolve esse problema (concorrentes diretos) e quais alternativas o cliente usa hoje (planilhas, processos manuais, nada)? Liste e comente.",
      },
      {
        key: "gaps_exploraveis",
        label: "Lacunas exploráveis",
        placeholder:
          "Onde os concorrentes falham ou deixam a desejar? Quais brechas você pode explorar para se diferenciar?",
      },
      {
        key: "posicionamento",
        label: "Posicionamento",
        placeholder:
          "Em uma frase, como você quer ser percebido no mercado e por quê? O que te torna a escolha óbvia para seu público.",
      },
      {
        key: "metricas_mercado",
        label: "Métricas de mercado",
        placeholder:
          "Números que dimensionam a oportunidade: tamanho do mercado/segmento, crescimento, ticket médio, ou qualquer dado que sustente o potencial.",
      },
    ],
  },
  etapa3: {
    title: "Proposta de Valor",
    description:
      "Defina o que torna sua solução única e desejável para o cliente.",
    subitems: [
      {
        key: "value_proposition_canvas",
        label: "Canvas de proposta de valor",
        placeholder:
          "Relacione as dores e ganhos do cliente com o que sua solução oferece: que tarefas ela facilita, que dores alivia, que ganhos gera.",
      },
      {
        key: "proposta_valor_final",
        label: "Proposta de valor final",
        placeholder:
          "A frase-síntese (headline) que comunica seu valor de forma clara e memorável. O que o cliente ganha ao escolher você.",
      },
      {
        key: "posicionamento",
        label: "Posicionamento",
        placeholder:
          "Por que sua solução é a melhor escolha para esse público? Qual o diferencial que sustenta esse posicionamento.",
      },
      {
        key: "metricas_sucesso",
        label: "Métricas de sucesso",
        placeholder:
          "Como você vai medir que a proposta de valor está funcionando? (ex.: adoção, retenção, satisfação, recompra.)",
      },
    ],
  },
  etapa4: {
    title: "Modelo de Negócio",
    description:
      "Descreva como sua startup gera receita e captura valor. (A DRE detalhada fica no Resumo Financeiro.)",
    subitems: [
      {
        key: "business_model_canvas",
        label: "Canvas do modelo de negócio",
        placeholder:
          "Principais blocos do seu modelo: fontes de receita, estrutura de custos, canais, parcerias-chave e recursos essenciais.",
      },
      {
        key: "unit_economics",
        label: "Unit economics",
        placeholder:
          "A economia por unidade/cliente: quanto custa adquirir um cliente (CAC), quanto ele gera ao longo do tempo (LTV), margem por venda.",
      },
      {
        key: "projecao_financeira_simplificada",
        label: "Projeção financeira simplificada",
        placeholder:
          "Visão geral dos próximos 12 meses: expectativa de receita, principais custos e quando você espera atingir o break-even.",
      },
    ],
  },
  etapa5: {
    title: "MVP",
    description:
      "Defina o produto mínimo viável para validar sua ideia com usuários reais.",
    subitems: [
      {
        key: "definicao_mvp",
        label: "Definição do MVP",
        placeholder:
          "Quais são as funcionalidades essenciais (core features) para o MVP? Foque no mínimo necessário para validar a hipótese principal.",
      },
      {
        key: "priorizacao_moscow",
        label: "Priorização (MoSCoW)",
        placeholder:
          "Classifique as funcionalidades: Must have (essencial), Should have (importante), Could have (desejável), Won't have (fora do MVP).",
      },
      {
        key: "stack_tecnologica",
        label: "Stack tecnológica",
        placeholder:
          "Que tecnologias/ferramentas você pretende usar para construir o MVP? (ex.: no-code, frameworks, serviços de nuvem.)",
      },
      {
        key: "metricas_validacao",
        label: "Métricas de validação",
        placeholder:
          "Como você vai saber se o MVP deu certo? Defina os sinais de validação (ex.: nº de usuários, conversão, feedback qualitativo).",
      },
      {
        key: "custo_desenvolvimento",
        label: "Custo de desenvolvimento",
        placeholder:
          "Estimativa de tempo e recursos para construir o MVP: quanto tempo, que time/orçamento, e principais custos envolvidos.",
      },
    ],
  },
};

/** Lista os subitens de uma etapa (vazio se a etapa não for manualizável). */
export function getManualSubitems(stage: string): ManualSubitem[] {
  return MANUAL_STAGE_CONFIGS[stage]?.subitems ?? [];
}
