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
import { markGeneratedDocumentsOutdated } from "@/lib/api/final-documents";
import { aiFillFinancialSummary, downloadFinancialSummaryPdf } from "@/lib/api/financial-summary";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, DollarSign, Loader2, LineChart as LineChartIcon, Sparkles, FileText } from "lucide-react";

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

/** True se a DRE já foi preenchida por IA (flag de uso único no content). */
function hasAiFilled(content: string | null | undefined): boolean {
  if (!content) return false;
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    return typeof parsed["dre_ai_filled_at"] === "string" && !!parsed["dre_ai_filled_at"];
  } catch {
    return false;
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
  const [isManual, setIsManual] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [aiFilling, setAiFilling] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserId(user?.id ?? null);

        const { data: project } = await supabase
          .from("projects")
          .select("creation_mode")
          .eq("id", projectId)
          .maybeSingle();
        setIsManual(project?.creation_mode === "manual");

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

  // Modo manual: garante uma DRE editável (zerada) mesmo sem geração prévia.
  const aiAlreadyFilled = hasAiFilled(rawContent);
  const effectiveDre = dre ?? (isManual ? ({} as Partial<DreData>) : null);

  // Só dá para baixar o PDF se a DRE já foi persistida (task resumo_financeiro existe).
  const canDownloadPdf = !!taskId;

  const handleDownloadPdf = async () => {
    if (!userId || !canDownloadPdf) return;
    setDownloadingPdf(true);
    try {
      await downloadFinancialSummaryPdf(projectId, userId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao baixar o PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleAiFill = async () => {
    if (!userId) return;
    setAiFilling(true);
    try {
      await aiFillFinancialSummary(projectId, userId);
      // Recarrega a task recém-preenchida.
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
      toast.success("DRE preenchida pela IA. Ajuste os valores como quiser.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao preencher a DRE com IA.");
    } finally {
      setAiFilling(false);
    }
  };

  const handleSave = async (updated: DreData) => {
    // Merge só da chave "dre" no content atual — preserva `sintese` e o resto.
    let parsed: Record<string, unknown>;
    try {
      parsed = rawContent ? JSON.parse(rawContent) : {};
    } catch {
      parsed = {};
    }
    parsed.dre = updated;
    const content = JSON.stringify(parsed, null, 2);

    if (taskId) {
      const { error } = await supabase.from("tasks").update({ content }).eq("id", taskId);
      if (error) throw new Error("Falha ao salvar a DRE no banco de dados");
    } else {
      // Modo manual: ainda não há task resumo_financeiro — cria ao primeiro save.
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          project_id: projectId,
          phase: "resumo_financeiro",
          title: "Resumo Financeiro",
          description: "Projeção para o primeiro ano",
          content,
          status: "evaluated",
        })
        .select("id")
        .single();
      if (error || !data) throw new Error("Falha ao criar a DRE no banco de dados");
      setTaskId(data.id as string);
    }
    setRawContent(content);

    // A DRE mudou: marca os documentos finais (Pitch/Plano/Resumo) que citam
    // números financeiros como desatualizados, para regeneração consciente.
    try {
      const marked = await markGeneratedDocumentsOutdated(projectId);
      if (marked > 0) {
        toast.info("Documentos finais marcados como desatualizados. Regenere-os para usar os novos números.");
      }
    } catch (err) {
      console.warn("Falha ao marcar documentos finais como desatualizados:", err);
    }
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

      {effectiveDre ? (
        <div className="space-y-6">
          {/* Modo manual: botão de preenchimento por IA (uso único). */}
          {isManual && !aiAlreadyFilled && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-primary">
                    Preencher com auxílio da IA
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    A IA monta uma projeção inicial a partir do seu projeto. Você ajusta depois.
                    Disponível uma vez — depois a edição é manual.
                  </p>
                </div>
                <Button onClick={handleAiFill} disabled={aiFilling} className="shrink-0 rounded-xl">
                  {aiFilling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {aiFilling ? "Gerando..." : "Preencher com auxílio da IA"}
                </Button>
              </CardContent>
            </Card>
          )}

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
              <DreTable dre={effectiveDre} onSave={handleSave} onDataChange={(d) => setSeries(computeSeriesMensais(d))} />
            </CardContent>
          </Card>

          {/* Gerar documento — PDF da DRE atualizada (mesmo padrão das etapas). */}
          {canDownloadPdf && (
            <Button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              size="lg"
              className="w-full gap-2 bg-[#8c7dff] hover:bg-[#7a6de6]"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando documento...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Gerar documento
                </>
              )}
            </Button>
          )}
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
