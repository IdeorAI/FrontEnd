// app/idea/ideorseg/page.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X, ChevronLeft, Lightbulb, Check, ChevronsUpDown } from "lucide-react";
import categories from "@/lib/data/categories.json";
import { generateStartupIdeas } from "@/lib/gemini-api";

export default function SegmentIdeasPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const projectId = sp.get("project_id");
  const { user, loading: userLoading } = useUser();
  const supabase = createClient();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'idle' | 'generating'>('idle');
  const [error, setError] = useState("");

  // carrega categoria do projeto (por id)
  useEffect(() => {
    (async () => {
      if (!user || !projectId) return;
      const { data } = await supabase
        .from("projects")
        .select("category")
        .eq("id", projectId)
        .maybeSingle();
      setSelectedCategory(data?.category || "");
    })().catch(console.error);
  }, [user, projectId, supabase]);

  const handleBack = () => projectId && router.replace(`/idea/create?project_id=${projectId}`);
  const handleClose = () => router.replace("/dashboard");

  const handleGenerateBySegment = async () => {
    setError("");
    if (!user || !projectId) return setError("Falha de contexto do projeto.");
    if (!selectedCategory) return setError("Selecione um segmento");

    setIsLoading(true);
    setLoadingStage('generating');
    try {
      const categoryLabel =
        (await import("@/lib/data/categories.json")).default.find(
          (c) => c.value === selectedCategory
        )?.label || selectedCategory;

      // Backend agora salva automaticamente em background
      const ideasResponse = await generateStartupIdeas({
        seedIdea: "",
        segmentDescription: categoryLabel,
        count: 4,
        projectId: projectId,
        ownerId: user.id,
        category: selectedCategory,
      });

      // Aguardar um pouco para garantir que o salvamento em background completou
      await new Promise(resolve => setTimeout(resolve, 500));

      // Atualizar o projeto com as ideias retornadas (garantir que esteja salvo)
      await supabase
        .from("projects")
        .update({
          generated_options: ideasResponse.ideas,
          category: selectedCategory
        })
        .eq("id", projectId);

      // Navega após garantir que está salvo
      router.replace(`/idea/ideorchoice?project_id=${projectId}`);
    } catch (e: any) {
      setLoadingStage('idle');
      setError(e?.message || "Falha ao gerar ideias.");
    } finally {
      setIsLoading(false);
      setLoadingStage('idle');
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
            <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handleGenerateBySegment}
              disabled={isLoading || !selectedCategory}
            >
              {loadingStage === 'generating' && "Gerando ideias..."}
              {loadingStage === 'idle' && !isLoading && "Gerar ideias"}
              {isLoading && loadingStage === 'idle' && "Processando..."}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
