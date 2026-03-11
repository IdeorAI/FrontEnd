"use client";

import { useTransition, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "./actions";

const perguntas = [
  {
    id: "has_idea",
    texto: "Você já tem uma ideia clara de negócio?",
    opcoes: [
      { valor: "sim_especifica", label: "Sim, tenho uma ideia específica" },
      { valor: "algumas_ideias", label: "Tenho algumas ideias" },
      { valor: "descobrindo", label: "Ainda estou descobrindo" },
    ],
  },
  {
    id: "objetivo",
    texto: "Qual é o seu objetivo com o IdeorAI?",
    opcoes: [
      { valor: "saber_valor", label: "Saber se minha ideia vale a pena" },
      { valor: "primeiros_clientes", label: "Conseguir meus primeiros clientes" },
      { valor: "pitch", label: "Preparar um pitch para investidores" },
    ],
  },
  {
    id: "socios",
    texto: "Você tem sócios ou está solo?",
    opcoes: [
      { valor: "solo", label: "Solo por enquanto" },
      { valor: "com_socios", label: "Tenho um ou mais sócios" },
    ],
  },
];

export function WelcomeForm() {
  const [isPending, startTransition] = useTransition();
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const todasRespondidas = perguntas.every((p) => respostas[p.id]);

  function handleSubmit() {
    if (!todasRespondidas) {
      setErroGeral("Por favor, responda todas as perguntas.");
      return;
    }
    setErroGeral(null);
    startTransition(async () => {
      await completeOnboarding(respostas as Parameters<typeof completeOnboarding>[0]);
    });
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">Configuração rápida</p>
        <p className="text-xs text-muted-foreground">Leva menos de 1 minuto</p>
      </div>

      {perguntas.map((pergunta, index) => (
        <div key={pergunta.id} className="space-y-3">
          <p className="font-medium text-sm">
            {index + 1}. {pergunta.texto}
          </p>
          <RadioGroup
            value={respostas[pergunta.id] || ""}
            onValueChange={(valor) =>
              setRespostas((prev) => ({ ...prev, [pergunta.id]: valor }))
            }
          >
            {pergunta.opcoes.map((opcao) => (
              <div key={opcao.valor} className="flex items-center space-x-2">
                <RadioGroupItem value={opcao.valor} id={`${pergunta.id}-${opcao.valor}`} />
                <Label htmlFor={`${pergunta.id}-${opcao.valor}`} className="cursor-pointer">
                  {opcao.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}

      {erroGeral && (
        <p className="text-sm text-red-500">{erroGeral}</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-[#8c7dff] hover:bg-[#7c6def]"
      >
        {isPending ? "Salvando..." : "Começar →"}
      </Button>
    </div>
  );
}
