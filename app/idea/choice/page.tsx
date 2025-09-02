// app/idea/choice/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, ChevronLeft, RefreshCcw, Check } from "lucide-react";

const BASE_OPTIONS = [
  "Transforme memórias em música: nossa IA cria canções exclusivas, com melodia e letra, a partir de uma simples foto. Um presente único para aniversários, casamentos ou qualquer celebração especial.",
  "De uma imagem a uma canção inesquecível. Usamos IA para compor músicas completas inspiradas em suas fotos, criando presentes emocionantes e personalizados para momentos que importam.",
  "Converter fotos em músicas originais com letra e melodia, usando IA. Ideal para surpreender em aniversários e datas especiais, transformando lembranças em trilhas sonoras únicas da sua história.",
];

export default function ChoicePage() {
  const router = useRouter();
  const { user } = useUser();
  const [options, setOptions] = useState<string[]>(BASE_OPTIONS);
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const regenerate = () => {
    // placeholder: embaralha e levemente varia a ordem
    setOptions((prev) => [...prev].sort(() => Math.random() - 0.5));
    setSelected(null);
  };
  const handleBack = () => router.replace("/idea/descreva");

  const handleContinue = async () => {
    if (selected === null) return;
    const description = options[selected];

    // salva a escolha como description do projeto do usuário
    if (user) {
      setSaving(true);
      const { error } = await supabase
        .from("projects")
        .update({ description })
        .eq("owner_id", user.id);

      setSaving(false);
      if (error) {
        // opcional: você pode trocar por um toast
        alert("Não foi possível salvar a descrição. Tente novamente.");
        return;
      }
    }

    router.replace("/idea/title");
  };

  return (
    <div className="mx-auto w-full max-w-[640px] py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          Tenho uma ideia inicial
        </h1>
      </div>
      {/* CARD CONTAINER */}
      <div
        className="
          mx-auto w-full max-w-[880px]
          rounded-3xl border border-white/10
          bg-[1e2830]  shadow-2xl
          px-5 py-6 sm:px-8 sm:py-8
        "
      >
        <div className="mb-5">
          <h2 className="text-base sm:text-lg font-semibold">
            Escolha uma das descrições:
          </h2>
          <p className="text-sm text-white/70">
            Selecione o texto que melhor descreve a sua proposta de Startup.
          </p>
        </div>

        <div className="space-y-3">
          {options.map((text, idx) => {
            const isActive = selected === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelected(idx)}
                className={`
                  w-full text-left
                  group focus:outline-none
                `}
                aria-pressed={isActive}
              >
                <Card
                  className={`
                    transition-all
                    border ${isActive ? "border-teal-300" : "border-white/10"}
                    bg-slate-900/60
                    hover:border-white/30
                    rounded-2xl
                    relative overflow-hidden
                  `}
                >
                  {/* faixa lateral para o selecionado */}
                  <div
                    className={`
                      absolute left-0 top-0 h-full w-1
                      ${isActive ? "bg-teal-300" : "bg-transparent"}
                    `}
                  />
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                          mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center
                          rounded-full border
                          ${
                            isActive
                              ? "border-teal-300 bg-teal-300/20"
                              : "border-white/20 bg-white/5"
                          }
                        `}
                      >
                        {isActive ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-xs opacity-80">{idx + 1}</span>
                        )}
                      </div>
                      <p
                        className={`text-sm leading-relaxed ${
                          isActive ? "text-teal-200" : "text-white/90"
                        }`}
                      >
                        {text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {/* ações */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={regenerate}
            className="order-2 sm:order-1"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Gerar novamente
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="order-2 sm:order-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Button
            type="button"
            onClick={handleContinue}
            disabled={selected === null || saving}
            className="order-1 sm:order-2"
          >
            {saving ? "Salvando..." : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
