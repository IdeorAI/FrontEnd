// app/idea/descreva/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/use-user";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import type { PostgrestError } from "@supabase/supabase-js";
import categories from "@/lib/data/categories.json";

// importe sua função que chama o Gemini
import { suggestAndSaveIdeas } from "@/lib/gemini-api";

function getErrorMessage(err: unknown): string {
  if (!err) return "Erro desconhecido";
  const e = err as Partial<PostgrestError>;
  return e.message || e.details || e.hint || "Erro ao criar projeto";
}

export default function IdeaDescribePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const projectId = sp.get("project_id");
  const { user } = useUser();
  const supabase = createClient();

  const [projectDescription, setProjectDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'idle' | 'saving' | 'generating'>('idle');
  const [error, setError] = useState("");

  // carrega o rascunho
  useEffect(() => {
    (async () => {
      if (!user || !projectId) return;
      const { data } = await supabase
        .from("projects")
        .select("description, category")
        .eq("id", projectId)
        .maybeSingle();

      setProjectDescription(data?.description || "");
      setSelectedCategory(data?.category || "");
    })().catch(console.error);
  }, [user, projectId, supabase]);

  const handleBack = () =>
    projectId && router.replace(`/idea/create?project_id=${projectId}`);
  const handleClose = () => router.replace("/dashboard");

  const handleSaveProject = async () => {
    setError("");
    if (!user || !projectId) return setError("Falha de contexto do projeto.");

    const description = projectDescription.trim();
    const category = selectedCategory;
    if (!description) return setError("A descrição do projeto é obrigatória");
    if (!category) return setError("Por favor, selecione uma categoria");

    setIsLoading(true);
    try {
      // 1) Atualiza descrição + categoria no projeto (por id)
      setLoadingStage('saving');
      const { error: updateError } = await supabase
        .from("projects")
        .update({ description: description || null, category })
        .eq("id", projectId);

      if (updateError) {
        setLoadingStage('idle');
        return setError(getErrorMessage(updateError));
      }

      // 2) Gera ideias com Gemini E salva no Supabase via backend
      setLoadingStage('generating');
      const categoryLabel =
        categories.find((c) => c.value === category)?.label || category;

      console.log("Chamando suggest-and-save com:", {
        ownerId: user.id,
        projectId: projectId,
        seedIdea: description,
        segmentDescription: categoryLabel,
        count: 3,
      });

      const ideasResponse = await suggestAndSaveIdeas({
        ownerId: user.id,
        projectId: projectId,
        seedIdea: description,
        segmentDescription: categoryLabel,
        count: 3,
      });

      console.log("Ideias geradas:", ideasResponse.ideas);

      // Aguardar um pouco para garantir que o salvamento em background completou
      await new Promise(resolve => setTimeout(resolve, 500));

      // Atualizar o projeto com as ideias retornadas (garantir que esteja salvo)
      await supabase
        .from("projects")
        .update({
          generated_options: ideasResponse.ideas
        })
        .eq("id", projectId);

      // 4) Redireciona mantendo o project_id
      router.replace(`/idea/choice?project_id=${projectId}`);
    } catch (err: unknown) {
      setLoadingStage('idle');
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
      setLoadingStage('idle');
    }
  };

  return (
    <div className="mx-auto w-full max-w-[640px] py-4 space-y-4">
      <div className="flex items-center justify-between ">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          Tenho uma ideia inicial
        </h1>

        <Button variant="ghost" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Descreva sua ideia</CardTitle>
          <CardDescription>
            Cite com poucas palavras o que você imagina para seu projeto. Deixe
            o Ideor lapidar sua ideia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Campo de Categoria */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Categoria do projeto
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedCategory
                      ? categories.find((c) => c.value === selectedCategory)?.label
                      : "Selecione uma categoria..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[min(100vw,640px)] max-h-[70vh] overflow-y-auto p-0 sm:max-w-[400px]">
                  <Command>
                    <CommandInput placeholder="Buscar categoria..." />
                    <CommandList>
                      <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem
                            key={category.value}
                            value={category.value}
                            onSelect={(currentValue: string) => {
                              setSelectedCategory(
                                currentValue === selectedCategory ? "" : currentValue
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

            {/* Campo de Descrição */}
            <div>
              <label
                htmlFor="project-description"
                className="block text-sm font-medium mb-1"
              >
                Descrição do projeto
              </label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Descreva sua ideia em até 400 caracteres..."
                rows={4}
                maxLength={400}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {projectDescription.length}/400
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-6">
            <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handleSaveProject}
              disabled={isLoading || !projectDescription.trim() || !selectedCategory}
            >
              {loadingStage === 'saving' && "Salvando..."}
              {loadingStage === 'generating' && "Gerando ideias..."}
              {loadingStage === 'idle' && !isLoading && "Enviar"}
              {isLoading && loadingStage === 'idle' && "Processando..."}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
