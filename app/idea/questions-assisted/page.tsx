// app/idea/questions-assisted/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X, ChevronLeft, Lightbulb } from "lucide-react";

export default function QuestionsAssistedPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const projectId = sp.get("project_id");
  const { user } = useUser();
  const supabase = createClient();

  const [productStructure, setProductStructure] = useState<string>("");
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Carrega os dados existentes se houver
  useEffect(() => {
    (async () => {
      if (!user || !projectId) return;
      const { data } = await supabase
        .from("projects")
        .select("product_structure, target_audience")
        .eq("id", projectId)
        .maybeSingle();

      if (data) {
        setProductStructure(data.product_structure || "");
        setTargetAudience(data.target_audience || "");
      }
    })().catch(console.error);
  }, [user, projectId, supabase]);

  const handleBack = () =>
    projectId && router.replace(`/idea/create?project_id=${projectId}`);
  const handleClose = () => router.replace("/dashboard");

  const handleContinue = async () => {
    setError("");
    if (!user || !projectId) return setError("Falha de contexto do projeto.");

    if (!productStructure) return setError("Por favor, selecione a estrutura do produto");
    if (!targetAudience) return setError("Por favor, selecione o público-alvo");

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          product_structure: productStructure,
          target_audience: targetAudience,
        })
        .eq("id", projectId);

      if (updateError) {
        return setError("Erro ao salvar as respostas");
      }

      // Redireciona para a próxima página do fluxo IDEOR
      router.replace(`/idea/ideorseg?project_id=${projectId}`);
    } catch (err) {
      setError("Erro inesperado ao salvar");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[640px] py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          Começar com ajuda do Ideor
        </h1>
        <Button variant="ghost" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Defina seu MVP</CardTitle>
          <CardDescription>
            Responda algumas perguntas para ajudar o Ideor a entender melhor seu projeto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Pergunta 1: Estrutura do Produto */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                1 - Qual é a estrutura principal do seu produto digital neste MVP?
              </Label>
              <RadioGroup value={productStructure} onValueChange={setProductStructure}>
                <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="SaaS (software como serviço)" id="saas" />
                  <Label htmlFor="saas" className="cursor-pointer font-normal flex-1">
                    SaaS (software como serviço)
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="Marketplace (conecta dois lados)" id="marketplace" />
                  <Label htmlFor="marketplace" className="cursor-pointer font-normal flex-1">
                    Marketplace (conecta dois lados)
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="App (Web ou Mobile)" id="app" />
                  <Label htmlFor="app" className="cursor-pointer font-normal flex-1">
                    App (Web ou Mobile)
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="API/Plataforma para desenvolvedores" id="api" />
                  <Label htmlFor="api" className="cursor-pointer font-normal flex-1">
                    API/Plataforma para desenvolvedores
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="Não sei/prefiro não definir" id="structure-undefined" />
                  <Label htmlFor="structure-undefined" className="cursor-pointer font-normal flex-1">
                    Não sei/prefiro não definir (o Ideor pode sugerir a melhor opção)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Pergunta 2: Público-alvo */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                2 - Qual é o público-alvo principal deste MVP?
              </Label>
              <RadioGroup value={targetAudience} onValueChange={setTargetAudience}>
                <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="B2B (empresas/organizações)" id="b2b" />
                  <Label htmlFor="b2b" className="cursor-pointer font-normal flex-1">
                    B2B (empresas/organizações)
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="B2C (consumidores finais)" id="b2c" />
                  <Label htmlFor="b2c" className="cursor-pointer font-normal flex-1">
                    B2C (consumidores finais)
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="Híbrido (B2B2C)" id="hybrid" />
                  <Label htmlFor="hybrid" className="cursor-pointer font-normal flex-1">
                    Híbrido (B2B2C)
                  </Label>
                </div>
                <div className="flex items-start space-x-2 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="Não sei/prefiro não definir" id="audience-undefined" />
                  <Label htmlFor="audience-undefined" className="cursor-pointer font-normal flex-1">
                    Não sei/prefiro não definir (o Ideor pode sugerir a melhor opção)
                  </Label>
                </div>
              </RadioGroup>
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
              onClick={handleContinue}
              disabled={isLoading || !productStructure || !targetAudience}
            >
              {isLoading ? "Salvando..." : "Continuar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
