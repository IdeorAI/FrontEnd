// app/idea/choice/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/use-user";

// UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb, ChevronLeft, Check } from "lucide-react";

export default function ChoicePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const projectId = sp.get("project_id");
  const { user } = useUser();
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      if (!user || !projectId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("generated_options")
        .eq("id", projectId)
        .single();

      if (!error && data?.generated_options) {
        setOptions(data.generated_options as string[]);
      }
      setLoading(false);
    })().catch(() => setLoading(false));
  }, [user, projectId, supabase]);

  const handleBack = () =>
    projectId && router.replace(`/idea/descreva?project_id=${projectId}`);

  const handleContinue = async () => {
    if (selected === null || !projectId) return;
    const description = options[selected];
    setSaving(true);
    const { error } = await supabase
      .from("projects")
      .update({ description })
      .eq("id", projectId);
    setSaving(false);
    if (error) return alert("Falha ao salvar.");
    router.replace(`/idea/title?project_id=${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Carregando opções...
      </div>
    );
  }

  // Se não houver opções após carregar
  if (options.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[880px] py-4 space-y-4 px-4">
        <Card className="rounded-3xl border-white/10 shadow-2xl p-6 sm:p-8">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar as ideias. Tente voltar e gerar novamente.
            </p>
            <Button onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[880px] py-4 space-y-4 px-4">
      <div className="flex items-center justify-between ">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          Tenho uma ideia inicial
        </h1>
      </div>

      {/* CARD PRINCIPAL */}
      <Card className="rounded-3xl border-white/10 shadow-2xl p-6 sm:p-8">
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
                    className={`transition-all border ${
                      isActive ? "border-teal-300" : "border-white/10"
                    } bg-slate-900/60 hover:border-white/30 rounded-2xl relative overflow-hidden`}
                  >
                    <div
                      className={`absolute left-0 top-0 h-full w-1 ${
                        isActive ? "bg-teal-300" : "bg-transparent"
                      }`}
                    />
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            isActive
                              ? "border-teal-300 bg-teal-300/20"
                              : "border-white/20 bg-white/5"
                          }`}
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

          {/* AÇÕES */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="order-1 sm:order-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

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
