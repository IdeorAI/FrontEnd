// app/idea/ideorchoice/page.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ChevronLeft, Check } from "lucide-react";
import categories from "@/lib/data/categories.json";

export default function IdeorChoicePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const projectId = sp.get("project_id");
  const { user, loading: userLoading } = useUser();
  const supabase = createClient();

  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryValue, setCategoryValue] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!user || !projectId) return;
      const { data, error } = await supabase
        .from("projects")
        .select("generated_options, category")
        .eq("id", projectId)
        .single();

      if (!error) {
        setOptions(Array.isArray(data?.generated_options) ? data!.generated_options : []);
        setCategoryValue(data?.category ?? "");
      }
      setLoading(false);
    })().catch(() => setLoading(false));
  }, [user, projectId, supabase]);

  const handleBack = () => projectId && router.replace(`/idea/ideorseg?project_id=${projectId}`);

  const handleContinue = async () => {
    if (selected === null || !projectId) return;
    setSaving(true);
    const description = options[selected]?.slice(0, 400) || "";
    const { error } = await supabase
      .from("projects")
      .update({ description })
      .eq("id", projectId);
    setSaving(false);
    if (error) return alert("Não foi possível salvar.");
    router.replace(`/idea/title?project_id=${projectId}`);
  };

  // Helper para dividir título e descrição
  const splitTitle = (text: string) => {
    const separators = [" — ", ": ", " – ", " - "];
    for (const sep of separators) {
      const idx = text.indexOf(sep);
      if (idx > 0) {
        return {
          title: text.substring(0, idx).trim(),
          desc: text.substring(idx + sep.length).trim(),
        };
      }
    }
    return { title: text, desc: "" };
  };

  // Encontrar o label da categoria
  const categoryLabel = useMemo(() => {
    if (!categoryValue) return "";
    return categories.find((c) => c.value === categoryValue)?.label || "";
  }, [categoryValue]);

  // Garantir 4 opções para exibir
  const displayed = useMemo(() => {
    if (!options || options.length === 0) {
      return [];
    }
    const result = [...options];
    while (result.length < 4) {
      result.push("");
    }
    return result.slice(0, 4);
  }, [options]);
  if (userLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Carregando opções...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Você precisa estar autenticado para continuar.
      </div>
    );
  }

  // Se não houver opções, mostrar mensagem de erro/recarregar
  if (displayed.length === 0 && !loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-4">
        <Card className="rounded-3xl border-white/10 p-5 shadow-2xl sm:p-8">
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
    <div className="mx-auto w-full max-w-5xl px-4 py-6 space-y-4 ">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between ">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Lightbulb className="h-6 w-6" />
          Começar com a ajuda do Ideor
        </h1>
      </div>

      {/* Main Card */}
      <Card className="rounded-3xl border-white/10 p-5 shadow-2xl sm:p-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold sm:text-lg">
            Escolha uma das ideias abaixo:
          </CardTitle>
          {categoryLabel && (
            <CardDescription className="text-sm">
              Categoria:{" "}
              <span className="font-medium text-teal-300">{categoryLabel}</span>
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {/* Grid de opções */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            {displayed.map((text, idx) => {
              const safe = text || `Opção ${idx + 1}`;
              const { title, desc } = splitTitle(safe);
              const isActive = selected === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelected(idx)}
                  aria-pressed={isActive}
                  className="group h-full text-left outline-none"
                >
                  <div
                    className={[
                      "relative flex h-full flex-col rounded-2xl border bg-slate-900/70 p-4 transition-all sm:p-5",
                      isActive
                        ? "border-teal-300 ring-2 ring-teal-300/40"
                        : "border-white/10 hover:border-white/30",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border",
                        isActive
                          ? "border-teal-300 bg-teal-300/20"
                          : "border-white/20 bg-white/5",
                      ].join(" ")}
                    >
                      {isActive ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-xs opacity-80">{idx + 1}</span>
                      )}
                    </div>

                    <h3
                      className={[
                        "pr-8 text-sm font-semibold leading-snug",
                        isActive ? "text-teal-200" : "text-white",
                      ].join(" ")}
                    >
                      {title}
                    </h3>
                    {desc && (
                      <p className="mt-2 flex-grow text-sm leading-relaxed text-white/80">
                        {desc}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Ações */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <Button
              type="button"
              onClick={handleContinue}
              disabled={selected === null || saving}
              className="w-full sm:w-auto"
            >
              {saving ? "Salvando..." : "Continuar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
