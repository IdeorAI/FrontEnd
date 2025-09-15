"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/use-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb, ChevronLeft, Check } from "lucide-react";
import categories from "@/lib/data/categories.json";

const FALLBACK_OPTIONS: string[] = [
  "Cofre de Dados PII — API que detecta e mascara dados sensíveis em bancos e planilhas, com auditoria e relatórios de conformidade.",
  "Copiloto de Briefing de Marketing — Gera briefings e cronogramas a partir de objetivos e dados, integrado a suites de analytics.",
  "Score de Risco de Churn B2B — Prevê cancelamento e sugere ações de retenção com modelos explicáveis.",
  "ETL Autônomo por Linguagem Natural — Construa pipelines descrevendo a intenção em frases, com validação automática.",
];

// Limita a N palavras; adiciona reticências se cortar.
function limitWords(text: string, maxWords: number) {
  const clean = (text || "").trim().replace(/\s+/g, " ");
  const words = clean.split(" ").filter(Boolean);
  if (words.length <= maxWords) return clean;
  return words.slice(0, maxWords).join(" ") + "…";
}

// Remove cercas de código e aspas extras
function stripFencesAndQuotes(s: string) {
  if (!s) return s;
  let t = s.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  // se for uma string com aspas envolventes, tenta desserializar
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    try {
      t = JSON.parse(t);
    } catch {
      t = t.slice(1, -1);
    }
  }
  return t;
}

// Tenta converter string em objeto { title, subtitle } se contiver JSON válido
function tryParseIdeaObject(
  text: string
): { title?: string; subtitle?: string } | null {
  const raw = stripFencesAndQuotes(text).replace(/\\n/g, " ").trim();
  try {
    const obj = JSON.parse(raw);
    if (
      obj &&
      typeof obj === "object" &&
      ("title" in obj || "subtitle" in obj)
    ) {
      return {
        title: String(obj.title ?? ""),
        subtitle: String(obj.subtitle ?? ""),
      };
    }
  } catch {
    // pode ser um JSON dentro de uma string escapada
    try {
      // exemplo: "{\n  \"title\": \"...\", \"subtitle\": \"...\" }"
      const unescaped = raw.replace(/\n/g, " ");
      const obj = JSON.parse(unescaped);
      if (
        obj &&
        typeof obj === "object" &&
        ("title" in obj || "subtitle" in obj)
      ) {
        return {
          title: String(obj.title ?? ""),
          subtitle: String(obj.subtitle ?? ""),
        };
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

// Divide em título/subtítulo lidando com JSON, separadores e fallback
function splitTitle(text: string) {
  if (!text) return { title: "", desc: "" };

  // 1) normalização básica
  // eslint-disable-next-line prefer-const
  let s = String(text)
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 2) Se vier um objeto JSON (ou string com objeto dentro), parseia
  const obj = tryParseIdeaObject(s);
  if (obj) {
    const title = limitWords(obj.title ?? "", 6);
    const desc = (obj.subtitle ?? "").trim();
    return { title, desc };
  }

  // 3) Se vier no formato "Título — Subtítulo" (ou variantes), separa
  const candidates = [" — ", ": ", " – ", " - ", ". "];
  let idx = -1;
  let token = "";
  for (const t of candidates) {
    const i = s.indexOf(t);
    if (i > 0 && (idx === -1 || i < idx)) {
      idx = i;
      token = t;
    }
  }
  if (idx > 0) {
    const title = limitWords(s.slice(0, idx).trim(), 6);
    const desc = s.slice(idx + token.length).trim();
    return { title, desc };
  }

  // 4) Sem separador: tudo vira título (limitado a 6 palavras)
  return { title: limitWords(s, 6), desc: "" };
}

export default function IdeorChoicePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const supabase = createClient();

  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryValue, setCategoryValue] = useState<string>("");

  const displayed = useMemo(() => {
    const result = [...options];
    while (result.length < 4) {
      result.push(FALLBACK_OPTIONS[result.length]);
    }
    return result.slice(0, 4);
  }, [options]);

  const categoryLabel = useMemo(() => {
    if (!categoryValue) return "";
    return (
      categories.find((c) => c.value === categoryValue)?.label || categoryValue
    );
  }, [categoryValue]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("generated_options, category")
          .eq("owner_id", user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar opções:", error);
          setOptions([]);
          setCategoryValue("");
        } else {
          if (data && Array.isArray(data.generated_options)) {
            // normaliza qualquer string com \n/aspas escapadas aqui
            const normalized = data.generated_options.map((s: string) =>
              stripFencesAndQuotes(String(s || ""))
                .replace(/\\n/g, " ")
                .replace(/\s+/g, " ")
                .trim()
            );
            setOptions(normalized);
          } else {
            setOptions([]);
          }
          setCategoryValue(data?.category ?? "");
        }
      } catch (e) {
        console.error("Erro no fetch:", e);
        setOptions([]);
        setCategoryValue("");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, supabase]);

  const handleBack = () => router.replace("/idea/ideorseg");

  const handleContinue = async () => {
    if (selected === null || !user) return;
    setSaving(true);
    const description = displayed[selected];

    // coluna description tem CHECK length <= 400
    const trimmed = (description || "").slice(0, 400);

    const { error } = await supabase
      .from("projects")
      .update({ description: trimmed })
      .eq("owner_id", user.id);

    setSaving(false);

    if (error) {
      alert("Não foi possível salvar sua escolha. " + (error.message || ""));
      return;
    }
    router.replace("/idea/title");
  };

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
