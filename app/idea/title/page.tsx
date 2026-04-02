// app/idea/title/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/use-user";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lightbulb, ChevronLeft, Save } from "lucide-react";
import categories from "@/lib/data/categories.json";

export default function TitlePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const projectId = sp.get("project_id");
  const { user } = useUser();
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!user || !projectId) return;
      const { data, error } = await supabase
        .from("projects")
        .select("name, description, category")
        .eq("id", projectId)
        .maybeSingle();

      if (!error && data) {
        setName(data.name ?? "");
        setDescription(data.description ?? "");
        setCategory(data.category ?? "");
      }
    })().catch(console.error);
  }, [user, projectId, supabase]);

  const handleBack = () =>
    projectId && router.replace(`/idea/choice?project_id=${projectId}`);

  const handleSave = async () => {
    setError("");
    if (!user || !projectId) {
      setError("Falha de contexto do projeto.");
      return;
    }

    const trimmed = name.trim();
    if (!trimmed) {
      setError("O nome do projeto é obrigatório.");
      return;
    }

    // garantir que respeita o CHECK (<= 400)
    const trimmedDesc = (description || "").slice(0, 400);

    setSaving(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({ name: trimmed, description: trimmedDesc || null })
        .eq("id", projectId);

      if (error) {
        setError(error.message || "Erro ao salvar");
        return;
      }
      router.replace("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  // label da categoria a partir do value
  const getCategoryLabel = (categoryValue: string) => {
    const foundCategory = categories.find(
      (cat: { value: string; label: string }) => cat.value === categoryValue
    );
    return foundCategory ? foundCategory.label : "Nenhuma categoria selecionada";
  };

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Você precisa estar autenticado.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[640px] py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          Tenho uma ideia inicial
        </h1>
      </div>

      {/* Card container */}
      <div
        className="
          mx-auto w-full max-w-[880px]
          rounded-3xl border border-white/10
          bg-[#202a31] backdrop-blur-lg shadow-2xl
          px-5 py-6 sm:px-8 sm:py-8
        "
      >
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-base sm:text-lg">
              Dê um nome ao seu projeto
            </CardTitle>
            <CardDescription>
              Escolha como quer chamar esta ideia. Você poderá alterar depois.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-6">
            {/* Nome do projeto */}
            <div>
              <Input
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="Digite o nome do projeto"
                maxLength={100}
                className="h-10"
              />
              <div className="mt-1 text-right text-xs text-white/60">
                {name.length}/100
              </div>
            </div>

            {/* Descrição (editável) */}
            <div>
              <div className="text-sm font-medium mb-1">Descrição:</div>
              <textarea
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(e.target.value)
                }
                placeholder="Descreva brevemente seu projeto (máx. 400 caracteres)"
                maxLength={400}
                rows={5}
                className="
                  w-full rounded-lg border border-white/10 bg-white/5
                  p-3 text-sm text-white/90 placeholder:text-white/40
                  focus:outline-none focus:ring-2 focus:ring-white/20
                "
              />
              <div className="mt-1 text-right text-xs text-white/60">
                {description?.length ?? 0}/400
              </div>
            </div>

            {/* Categoria selecionada (somente leitura) */}
            <div>
              <div className="text-sm font-medium mb-1">
                Categoria selecionada:
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 sm:p-4 text-sm text-white/90 min-h-[3rem] flex items-center">
                {category
                  ? getCategoryLabel(category)
                  : "Nenhuma categoria selecionada"}
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
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
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="order-2 sm:order-2"
              >
                {saving ? (
                  "Salvando..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
