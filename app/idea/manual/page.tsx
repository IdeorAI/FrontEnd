// app/idea/manual/page.tsx
// Fase 1 — 3ª opção de criação: o usuário escreve a ideia e ela é gravada
// integralmente em projects.description, SEM nenhuma chamada de LLM.
// Layout espelhado de app/idea/descreva (padrão mais legível).
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
import { X, ChevronLeft, PencilLine, Check, ChevronsUpDown } from "lucide-react";
import type { PostgrestError } from "@supabase/supabase-js";
import categories from "@/lib/data/categories.json";

function getErrorMessage(err: unknown): string {
  if (!err) return "Erro desconhecido";
  const e = err as Partial<PostgrestError>;
  return e.message || e.details || e.hint || "Erro ao salvar projeto";
}

export default function IdeaManualPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const projectId = sp.get("project_id");
  const { user } = useUser();
  const supabase = createClient();

  const [projectDescription, setProjectDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // carrega o rascunho (se o usuário voltar para esta tela)
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
    if (!description) return setError("A descrição da ideia é obrigatória");
    if (!category) return setError("Por favor, selecione uma categoria");

    setIsLoading(true);
    try {
      // Grava a ideia integral + categoria no projeto. SEM chamada de LLM.
      const { error: updateError } = await supabase
        .from("projects")
        .update({ description, category })
        .eq("id", projectId);

      if (updateError) {
        setIsLoading(false);
        return setError(getErrorMessage(updateError));
      }

      // Segue direto para nomear o projeto (sem etapa de opções geradas).
      router.replace(`/idea/title?project_id=${projectId}`);
    } catch (err: unknown) {
      setIsLoading(false);
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto w-full max-w-[640px] py-4 px-4 space-y-4">
      <div className="flex items-center justify-between ">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <PencilLine className="h-6 w-6" />
          Escrever minha ideia
        </h1>

        <Button variant="ghost" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sua ideia, com suas palavras</CardTitle>
          <CardDescription>
            Escreva a ideia do jeito que você imagina. O texto é salvo
            exatamente como está, sem sugestões automáticas da IA.
            Use até 400 caracteres para resumir o essencial.
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
                Sua ideia
              </label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Descreva sua ideia em até 400 caracteres..."
                rows={6}
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
              {isLoading ? "Salvando..." : "Continuar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
