// app/idea/choice/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/use-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Lightbulb, ChevronLeft, Check } from "lucide-react";

const BASE_OPTIONS = [
  "Transforme memórias em música: nossa IA cria canções exclusivas, com melodia e letra, a partir de uma simples foto. Um presente único para aniversários, casamentos ou qualquer celebração especial.",
  "De uma imagem a uma canção inesquecível. Usamos IA para compor músicas completas inspiradas em suas fotos, criando presentes emocionantes e personalizados para momentos que importam.",
  "Converter fotos em músicas originais com letra e melodia, usando IA. Ideal para surpreender em aniversários e datas especiais, transformando lembranças em trilhas sonoras únicas da sua história.",
];

export default function ChoicePage() {
  const router = useRouter();
  const { user } = useUser();
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchGeneratedOptions = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("generated_options")
          .eq("owner_id", user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar opções:", error);
          // Fallback para opções base
          setOptions(BASE_OPTIONS);
        } else if (data?.generated_options) {
          setOptions(data.generated_options);
        } else {
          setOptions(BASE_OPTIONS);
        }
      } catch (error) {
        console.error("Erro ao buscar opções:", error);
        setOptions(BASE_OPTIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneratedOptions();
  }, [user, supabase]);

  const handleBack = () => router.replace("/idea/descreva");

  // const regenerate = () => {
  //   setOptions((prev) => [...prev].sort(() => Math.random() - 0.5));
  //   setSelected(null);
  // };

  const handleContinue = async () => {
    if (selected === null) return;
    const description = options[selected];

    if (user) {
      setSaving(true);
      const { error } = await supabase
        .from("projects")
        .update({ description })
        .eq("owner_id", user.id);

      setSaving(false);
      if (error) {
        alert("Não foi possível salvar a descrição. Tente novamente.");
        return;
      }
    }

    router.replace("/idea/title");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Carregando opções...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[880px] py-4 px-4">
      <div className="flex items-center justify-between ">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          Tenho uma ideia inicial
        </h1>
      </div>

      {/* CARD PRINCIPAL */}
      <Card className="rounded-3xl border-white/10   shadow-2xl p-6 sm:p-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold">
            Escolha uma das descrições:
          </CardTitle>
          <CardDescription className="text-sm text-white/70">
            Selecione o texto que melhor descreve a sua proposta de Startup.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            {options.map((text, idx) => {
              const isActive = selected === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelected(idx)}
                  className="w-full text-left group focus:outline-none"
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
                            <span className="text-xs opacity-80">
                              {idx + 1}
                            </span>
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

          {/* AÇÕES */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
            {/* VOLTAR - Primeiro botão */}
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="order-1 sm:order-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

           

            {/* CONTINUAR -  botão */}
            <Button
              type="button"
              onClick={handleContinue}
              disabled={selected === null || saving}
              className="order-3 sm:order-3"
            >
              {saving ? "Salvando..." : "Continuar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}