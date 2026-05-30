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
        label: "Gostaria de acrescentar mais alguma coisa? (edite abaixo)",
        type: "textarea",
        placeholder: "Qual problema você identificou e como sua solução o resolve? Ex: 'Clínicas pequenas perdem 30% das consultas por falta de lembretes. Enviamos notificações via WhatsApp e reduzimos cancelamentos em até 40%.'",
        required: true,
      },
      // "Quem é o cliente?" (mercado) e "Região/País" (regiao) removidos.
      // Já coletados na criação do projeto e injetados pelo backend a partir
      // de project.TargetAudience / project.Region.
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
        label: "Quem você imagina como seu primeiro cliente? (O nicho da sua Startup)",
        type: "text",
        placeholder: "Pense nas pessoas ou empresas que mais sentem o problema que sua startup resolve.",
        required: true,
        aiDecideLabel: "Quero que o IdeorAI defina",
      },
      {
        name: "ideia",
        label: "Resumo até aqui (edite se quiser)",
        type: "textarea",
        placeholder: "Qual problema resolve, para quem, como funciona e o que te diferencia das alternativas que já existem.",
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
        label: "Qual a principal dor do cliente que a sua startup resolve?",
        type: "textarea",
        placeholder: "Descreva o principal resultado ou benefício esperado.",
        required: true,
      },
      // "Personas" removido — já gerado dentro da etapa 1.
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
        label: "Como você imagina ganhar dinheiro com essa startup?",
        type: "textarea",
        placeholder: "Venda única, assinatura mensal, comissão por transação, publicidade ou outra forma.",
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
        label: "Como seria a primeira versão do seu produto?",
        type: "textarea",
        placeholder: "Landing page, aplicativo, plataforma web, marketplace, app mobile ou outra ideia.",
        required: true,
      },
    ],
  },
};
