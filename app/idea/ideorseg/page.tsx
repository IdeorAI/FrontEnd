"use client";

import { useEffect, useState } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, ChevronLeft, Lightbulb, Check, ChevronsUpDown } from "lucide-react";
import type { PostgrestError } from "@supabase/supabase-js";
import categories from "@/lib/data/categories.json";

type IdeasResponse = { ideas: string[]; requestId?: string };

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getErrorMessage(err: unknown): string {
  if (!err) return "Erro desconhecido";
  if (typeof err === "string") return err;
  const e = err as Partial<PostgrestError> & {
    message?: string;
    error?: string;
    detail?: string;
  };
  return e.message || e.error || e.details || e.detail || "Falha na operação";
}

function apiBase(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(
    /\/$/,
    ""
  );
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

// NOVO: usa o endpoint que já GERA e SALVA no backend (1 chamada só)
async function requestSuggestAndSave(
  segmentLabel: string,
  ownerId: string,
  count = 4
): Promise<IdeasResponse> {
  const url = `${apiBase()}/api/GeminiAI/suggest-and-save`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({ ownerId, segmentDescription: segmentLabel, count }),
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error || j?.detail || "";
    } catch {
      /* noop */
    }
    throw new Error(
      `Falha ao gerar/salvar ideias (${res.status}). ${detail}`.trim()
    );
  }
  return (await res.json()) as IdeasResponse;
}

export default function SegmentIdeasPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  // Puxa a categoria atual (há unique em owner_id -> 1 projeto por usuário)
  useEffect(() => {
    const fetchProjectCategory = async () => {
      if (!user) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("category")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setSelectedCategory(data.category || "");
      }
    };

    fetchProjectCategory();
  }, [user]);

  const handleBack = () => router.replace("/idea/create");

  const handleClose = () => {
    router.replace("/dashboard");
  };

  const handleGenerateBySegment = async () => {
    setError("");
    if (!user) {
      setError("Usuário não autenticado");
      return;
    }
    const category = selectedCategory;
    if (!category) {
      setError("Por favor, selecione um segmento");
      return;
    }

    setIsLoading(true);

    try {
      const categoryLabel =
        categories.find((c) => c.value === category)?.label || category;

      // 1) Chamada ÚNICA ao backend: gera e salva no Supabase
      const ideasResponse = await requestSuggestAndSave(
        categoryLabel,
        user.id,
        4
      );
      console.log("Ideias (geradas e salvas no backend):", ideasResponse.ideas);

      // 2) Redirecionar
      router.replace("/idea/ideorchoice");
    } catch (err: unknown) {
      console.error("Falha ao gerar/salvar ideias:", safeStringify(err));
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Carregando.
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
    <div className="mx-auto w-full max-w-[640px] py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          Começar com ajuda do Ideor
        </h1>

        <Button variant="ghost" onClick={handleClose} aria-label="Fechar">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Escolha um segmento</CardTitle>
          <CardDescription>
            Selecione um segmento e o Ideor vai gerar{" "}
            <strong>4 ideias inovadoras</strong> com base nessa escolha.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Segmento</label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedCategory
                      ? categories.find(
                          (category) => category.value === selectedCategory
                        )?.label
                      : "Selecione um segmento."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[min(100vw,640px)] max-h-[70vh] overflow-y-auto p-0 sm:max-w-[400px]">
                  <Command>
                    <CommandInput placeholder="Buscar segmento." />
                    <CommandList>
                      <CommandEmpty>Nenhum segmento encontrado.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem
                            key={category.value}
                            value={category.value}
                            onSelect={(currentValue) => {
                              setSelectedCategory(
                                currentValue === selectedCategory
                                  ? ""
                                  : currentValue
                              );
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedCategory === category.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            <div className="flex flex-col">
                              <span>{category.label}</span>
                              <span className="text-xs text-muted-foreground whitespace-normal break-words">
                                {category.description}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-6">
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handleGenerateBySegment}
              disabled={isLoading || !selectedCategory}
            >
              {isLoading ? "Gerando..." : "Gerar ideias"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
