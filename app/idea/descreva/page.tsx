// app/idea/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/use-user";
import { Button } from "@/components/ui/button";
//import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, ChevronLeft, Lightbulb } from "lucide-react";
import type { PostgrestError } from "@supabase/supabase-js";

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
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
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
        .select("name, description")
        .eq("owner_id", user.id)
        .maybeSingle(); // retorna null se não houver projeto

      if (!error && data) {
        setProjectName(data.name || "");
        setProjectDescription(data.description || "");
      }
    };

    fetchProject();
  }, [user]);

  const handleBack = () => router.replace("/idea/create");

  const handleClose = () => {
    try {
      // tenta navegação SPA
      router.replace("/dashboard");
    } catch {
      // fallback hard refresh
      window.location.href = "/dashboard";
    } finally {
      // se quiser, também pode disparar o hard refresh após um pequeno atraso:
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
    const name = projectName.trim();
    const description = projectDescription.trim();

    if (!name) {
      setError("O nome do projeto é obrigatório");
      return;
    }
    if (name.length > 100) {
      setError("O nome do projeto deve ter no máximo 100 caracteres");
      return;
    }
    if (description.length > 400) {
      setError("A descrição deve ter no máximo 400 caracteres");
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          description: description || null,
        })
        .eq("owner_id", user.id);

      if (updateError) {
        setError(getErrorMessage(updateError));
        return;
      }

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
    <div className="mx-auto w-full max-w-[640px] py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          Tenho uma ideia inicial
        </h1>

        {/* Ícone de fechar: SEM disabled para não “prender” na tela */}
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
          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="order-2 sm:order-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>

            <Button
              type="button"
              onClick={handleSaveProject}
              disabled={isLoading || !projectName.trim()}
            >
              {isLoading ? "Salvando..." : <>Enviar</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
