"use client";

// Tela "análise financeira detalhada" (Spec 022 v2) — renderiza a DRE completa
// (DreTable) lendo a task `resumo_financeiro`. A edição persiste a chave `dre`
// no content da task, sem chamar LLM. O card no right menu reflete os novos
// números via backend (que recalcula a síntese da DRE salva).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DreTable,
  computeSeriesMensais,
  type DreData,
  type DreSeriePonto,
} from "@/components/dre-table";
import { DreChart } from "@/components/dre-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, DollarSign, Loader2, LineChart as LineChartIcon } from "lucide-react";

interface Props {
  projectId: string;
  projectName: string;
}

function extractDre(content: string | null | undefined): Partial<DreData> | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    const dre = parsed["dre"];
    return dre && typeof dre === "object" ? (dre as Partial<DreData>) : null;
  } catch {
    return null;
  }
}

export function FinanceiroClient({ projectId, projectName }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [dre, setDre] = useState<Partial<DreData> | null>(null);
  const [series, setSeries] = useState<DreSeriePonto[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("tasks")
          .select("id, content")
          .eq("project_id", projectId)
          .eq("phase", "resumo_financeiro")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          const extracted = extractDre(data.content as string);
          setTaskId(data.id as string);
          setRawContent(data.content as string);
          setDre(extracted);
          setSeries(computeSeriesMensais(extracted));
        }
      } finally {
        setLoading(false);
      }
    })().catch(console.error);
  }, [projectId, supabase]);

  const handleSave = async (updated: DreData) => {
    if (!taskId) return;
    // Merge só da chave "dre" no content atual — preserva `sintese` e o resto.
    let parsed: Record<string, unknown>;
    try {
      parsed = rawContent ? JSON.parse(rawContent) : {};
    } catch {
      parsed = {};
    }
    parsed.dre = updated;
    const content = JSON.stringify(parsed, null, 2);

    const { error } = await supabase.from("tasks").update({ content }).eq("id", taskId);
    if (error) throw new Error("Falha ao salvar a DRE no banco de dados");
    setRawContent(content);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 -ml-2">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ink-primary">
          <DollarSign className="h-6 w-6 text-primary" />
          Análise Financeira
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Projeção (DRE) para o primeiro ano de {projectName}. Edite os valores de entrada — os
          totais recalculam automaticamente.
        </p>
      </div>

      {dre ? (
        <div className="space-y-6">
          {/* Gráfico — atualiza a cada edição da DRE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LineChartIcon className="h-4 w-4 text-primary" />
                Evolução financeira (12 meses)
              </CardTitle>
              <CardDescription>
                Receita Bruta, Despesas (todas as saídas) e Lucro Líquido por mês.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DreChart data={series} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Demonstração de Resultado (DRE)</CardTitle>
              <CardDescription>
                Ajuste receita, custos e despesas. As alterações são refletidas no card Resumo
                Financeiro, no gráfico acima e nos documentos finais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DreTable dre={dre} onSave={handleSave} onDataChange={(d) => setSeries(computeSeriesMensais(d))} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            O Resumo Financeiro ainda não foi gerado. Volte ao projeto e clique em
            &ldquo;Gerar resumo financeiro&rdquo;.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
