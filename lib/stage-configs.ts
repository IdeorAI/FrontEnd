import { FormField } from "@/components/stage-form";

export interface StageConfig {
  phase: string;
  title: string;
  description: string;
  fields: FormField[];
}

export const STAGE_CONFIGS: Record<string, StageConfig> = {
  etapa1: {
    phase: "etapa1",
    title: "Etapa 1: Problema e Oportunidade",
    description:
      "Vamos clarificar a dor central, público-alvo e contexto competitivo através de pesquisa estruturada.",
    fields: [
      {
        name: "ideia",
        label: "Ideia Inicial",
        type: "textarea",
        placeholder: "Descreva sua ideia em 2-3 frases...",
        required: true,
      },
      {
        name: "mercado",
        label: "Mercado/Segmento-alvo",
        type: "text",
        placeholder: "Ex: saúde digital para clínicas pequenas",
        required: false,
      },
      {
        name: "regiao",
        label: "Região/País de Atuação",
        type: "text",
        placeholder: "Ex: Brasil",
        defaultValue: "Brasil",
        required: true,
      },
    ],
  },

  etapa2: {
    phase: "etapa2",
    title: "Etapa 2: Pesquisa de Mercado",
    description:
      "Dimensionamento de mercado (TAM/SAM/SOM), análise competitiva e validação de preço.",
    fields: [
      {
        name: "segmento",
        label: "Segmento de Mercado",
        type: "text",
        placeholder: "Ex: SaaS B2B para PMEs",
        required: true,
      },
      {
        name: "ideia",
        label: "Resumo da Ideia",
        type: "textarea",
        placeholder: "Descreva brevemente sua solução...",
        required: true,
      },
    ],
  },

  etapa3: {
    phase: "etapa3",
    title: "Etapa 3: Proposta de Valor",
    description:
      "Definir jobs-to-be-done, aliviar dores específicas e criar ganhos tangíveis através do Value Proposition Canvas.",
    fields: [
      {
        name: "problema",
        label: "Problema Validado",
        type: "textarea",
        placeholder: "Qual problema você está resolvendo?",
        required: true,
      },
      {
        name: "personas",
        label: "Personas Principais",
        type: "textarea",
        placeholder: "Descreva suas personas principais...",
        required: true,
      },
    ],
  },

  etapa4: {
    phase: "etapa4",
    title: "Etapa 4: Modelo de Negócio",
    description:
      "Estruturar o Business Model Canvas completo com todos os 9 blocos e projeção financeira.",
    fields: [
      {
        name: "proposta_valor",
        label: "Proposta de Valor",
        type: "textarea",
        placeholder: "Sua proposta de valor validada...",
        required: true,
      },
    ],
  },

  etapa5: {
    phase: "etapa5",
    title: "Etapa 5: MVP (Minimum Viable Product)",
    description:
      "Definir funcionalidades core, fluxo mínimo do produto, hipóteses de teste e formatos de MVP.",
    fields: [
      {
        name: "proposta_valor",
        label: "Proposta de Valor",
        type: "textarea",
        placeholder: "Sua proposta de valor...",
        required: true,
      },
    ],
  },
};
