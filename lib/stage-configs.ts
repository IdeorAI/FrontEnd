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
      {
        name: "recursos",
        label: "Restrições e Recursos",
        type: "textarea",
        placeholder: "Ex: orçamento limitado, equipe de 2 pessoas...",
        required: false,
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
        name: "regiao",
        label: "Região de Atuação do MVP",
        type: "text",
        placeholder: "Ex: Brasil, São Paulo",
        defaultValue: "Brasil",
        required: true,
      },
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
      {
        name: "segmento",
        label: "Segmento de Clientes",
        type: "text",
        placeholder: "Quem são seus clientes?",
        required: true,
      },
    ],
  },

  etapa5: {
    phase: "etapa5",
    title: "Etapa 5: MVP (Minimum Viable Product)",
    description:
      "Definir funcionalidades core, priorizar features (MoSCoW) e estimar stack tecnológico.",
    fields: [
      {
        name: "proposta_valor",
        label: "Proposta de Valor",
        type: "textarea",
        placeholder: "Sua proposta de valor...",
        required: true,
      },
      {
        name: "recursos",
        label: "Recursos Disponíveis",
        type: "text",
        placeholder: "Ex: limitados, médios, abundantes",
        defaultValue: "limitados",
        required: true,
      },
    ],
  },

  etapa6: {
    phase: "etapa6",
    title: "Etapa 6: Equipe Mínima",
    description:
      "Definir papéis essenciais, perfis ideais e estrutura de equity/remuneração.",
    fields: [
      {
        name: "mvp",
        label: "Descrição do MVP",
        type: "textarea",
        placeholder: "Resumo do seu MVP...",
        required: true,
      },
      {
        name: "fase",
        label: "Fase da Startup",
        type: "select",
        options: ["pré-seed", "seed", "série A"],
        defaultValue: "pré-seed",
        required: true,
      },
    ],
  },

  etapa7: {
    phase: "etapa7",
    title: "Etapa 7: Pitch Deck + Plano Executivo + Resumo",
    description:
      "Consolidar todas as etapas anteriores em um pitch deck de 12 slides, plano executivo e resumo.",
    fields: [
      {
        name: "nome",
        label: "Nome do Projeto",
        type: "text",
        placeholder: "Nome da sua startup",
        required: true,
      },
      {
        name: "etapas_anteriores",
        label: "Resumo das Etapas Anteriores",
        type: "textarea",
        placeholder:
          "Cole aqui um resumo dos principais pontos das etapas 1-6...",
        required: true,
      },
    ],
  },
};
