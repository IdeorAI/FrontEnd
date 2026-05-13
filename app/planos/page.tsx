import type { Metadata } from 'next'
import { Check, Zap, Star, Building } from "lucide-react";

export const metadata: Metadata = {
  title: 'Planos — IdeorAI',
  description: 'Escolha o plano ideal para acelerar suas ideias de startup.',
}
import { Button } from "@/components/ui/button";
import type { ComponentType } from "react";

type Plan = {
  name: string;
  icon: ComponentType<{ className?: string }>;
  price: string;
  period: string;
  description: string;
  highlight: boolean;
  features: string[];
  cta: string;
  ctaDisabled: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    icon: Zap,
    price: "R$ 0",
    period: "/mês",
    description: "Para começar a validar suas ideias",
    highlight: false,
    features: [
      "3 projetos ativos",
      "Análise de IA básica (3 etapas)",
      "Relatórios simples",
      "Suporte via email",
    ],
    cta: "Plano atual",
    ctaDisabled: true,
  },
  {
    name: "Pro",
    icon: Star,
    price: "R$ 49",
    period: "/mês",
    description: "Para empreendedores sérios",
    highlight: true,
    features: [
      "Projetos ilimitados",
      "Análise completa (7 etapas)",
      "Relatórios avançados com PDF",
      "Score e valuation detalhado",
      "Marketplace de serviços",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    ctaDisabled: false,
  },
  {
    name: "Enterprise",
    icon: Building,
    price: "Sob consulta",
    period: "",
    description: "Para aceleradoras e times",
    highlight: false,
    features: [
      "Tudo do Pro",
      "Multi-usuário e times",
      "API dedicada",
      "Dashboard analítico",
      "SLA garantido",
      "Gerente de conta",
    ],
    cta: "Falar com vendas",
    ctaDisabled: false,
  },
];

export default function PlanosPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Planos</h1>
        <p className="text-muted-foreground mt-1">Escolha o plano ideal para o seu momento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`bg-card border rounded-lg p-6 flex flex-col gap-4 relative ${
                plan.highlight ? "border-primary ring-1 ring-primary" : ""
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Mais popular
                </span>
              )}
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    plan.highlight ? "bg-primary" : "bg-primary/20"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      plan.highlight ? "text-primary-foreground" : "text-primary"
                    }`}
                  />
                </div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
              </div>

              <div>
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <ul className="flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.highlight ? "default" : "outline"}
                disabled={plan.ctaDisabled}
              >
                {plan.cta}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Pagamentos processados com segurança. Cancele quando quiser.
      </p>
    </div>
  );
}
