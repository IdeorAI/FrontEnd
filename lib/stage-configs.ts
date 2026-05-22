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
        label: "Problema e Solução",
        type: "textarea",
        placeholder: "Qual problema você identificou e como sua solução o resolve? Ex: 'Clínicas pequenas perdem 30% das consultas por falta de lembretes. Enviamos notificações via WhatsApp e reduzimos cancelamentos em até 40%.'",
        required: true,
      },
      {
        name: "mercado",
        label: "Quem é o cliente?",
        type: "text",
        placeholder: "Tipo de negócio, porte e localização. Ex: 'Clínicas de fisioterapia com 1 a 5 profissionais no interior de SP'",
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
        label: "Nicho do MVP",
        type: "text",
        placeholder: "Setor, porte da empresa e perfil de quem decide a compra. Ex: 'Escritórios de contabilidade com até 10 funcionários atendendo PJ'",
        required: true,
      },
      {
        name: "ideia",
        label: "Sua solução em resumo",
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
        label: "Problema Validado",
        type: "textarea",
        placeholder: "Use dados quando tiver. Quem sofre, com que frequência, qual o custo real (tempo, dinheiro) e por que as soluções atuais não resolvem. Ex: 'Gestores de RH de PMEs gastam 8h/semana em planilhas de ponto porque os sistemas existentes custam caro demais para empresas de 50 pessoas.'",
        required: true,
      },
      {
        name: "personas",
        label: "Personas",
        type: "textarea",
        placeholder: "1 a 2 personas com contexto real: cargo, rotina, dor principal e o que os faria pagar. Ex: 'Ana, 34 anos, Gerente de RH, empresa de 50 funcionários. Passa horas corrigindo erros de ponto e não tem budget para sistemas grandes.'",
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
        placeholder: "[Solução] ajuda [segmento] que enfrenta [problema] a conseguir [benefício]. Diferente de [alternativa] porque [diferenciador]. Ex: 'Nossa plataforma ajuda clínicas de fisioterapia a reduzir cancelamentos em 40%. Diferente de agenda manual porque confirma presença automaticamente pelo WhatsApp.'",
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
        placeholder: "Escreva sua proposta de valor final. O MVP será desenhado em torno do que está aqui: quanto mais específico, mais objetivo será o escopo de funcionalidades.",
        required: true,
      },
    ],
  },
};
