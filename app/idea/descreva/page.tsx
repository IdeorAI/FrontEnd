// app/idea/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { generateStartupIdeas } from '@/lib/gemini-api';

function getErrorMessage(err: unknown): string {
  if (!err) return "Erro desconhecido";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  // Supabase PostgrestError
  const maybePg = err as Partial<PostgrestError>;
  return (
    maybePg.message ||
    maybePg.details ||
    maybePg.hint ||
    "Erro ao criar projeto"
  );
}

export default function IdeaCreationPage() {
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    const fetchProject = async () => {
      if (!user) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("description, category")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setProjectDescription(data.description || "");
        setSelectedCategory(data.category || "");
      }
    };

    fetchProject();
  }, [user]);

  const handleBack = () => router.replace("/idea/create");

  const handleClose = () => {
    try {
      router.replace("/dashboard");
    } catch {
      window.location.href = "/dashboard";
    } finally {
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 0);
    }
  };

  const handleSaveProject = async () => {
    setError("");
    if (!user) {
      setError("Usuário não autenticado");
      return;
    }
    
    const description = projectDescription.trim();
    const category = selectedCategory;

    if (description.length === 0) {
      setError("A descrição do projeto é obrigatória");
      return;
    }
    if (description.length > 400) {
      setError("A descrição deve ter no máximo 400 caracteres");
      return;
    }
    if (!category) {
      setError("Por favor, selecione uma categoria");
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      // 1. Salvar no Supabase
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          description: description || null,
          category: category,
        })
        .eq("owner_id", user.id);

      if (updateError) {
        setError(getErrorMessage(updateError));
        return;
      }

      // 2. Gerar ideias com Gemini
      const categoryLabel = categories.find(c => c.value === category)?.label || category;
      
      const ideasResponse = await generateStartupIdeas({
        seedIdea: description,
        segmentDescription: categoryLabel
      });

      // 3. Salvar as ideias geradas no Supabase
      const { error: ideasError } = await supabase
        .from("projects")
        .update({ 
          generated_options: ideasResponse.ideas 
        })
        .eq("owner_id", user.id);

      if (ideasError) {
        console.error("Erro ao salvar opções:", ideasError);
      }

      // 4. Redirecionar para a página de escolha
      router.replace("/idea/choice");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Você precisa estar autenticado para criar um projeto.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[640px] py-4">
      <div className="flex items-center justify-between ">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          Tenho uma ideia inicial
        </h1>

        <Button variant="ghost" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card >
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
                      ? categories.find(
                          (category) => category.value === selectedCategory
                        )?.label
                      : "Selecione uma categoria..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 sm:max-w-[400px]">
                  <Command>
                    <CommandInput placeholder="Buscar categoria..." />
                    <CommandList>
                      <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
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
                              <span className="text-xs text-muted-foreground">
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
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handleSaveProject}
              disabled={
                isLoading || !projectDescription.trim() || !selectedCategory
              }
            >
              {isLoading ? "Salvando..." : "Enviar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}