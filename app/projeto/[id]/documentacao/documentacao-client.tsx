"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Presentation,
  BookOpen,
  FileText,
  Loader2,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  type DocType,
  type GeneratedDocSummary,
  generateFinalDocument,
  downloadFinalDocumentPdf,
  listGeneratedDocuments,
} from "@/lib/api/final-documents";
import { cn } from "@/lib/utils";

interface DocumentacaoClientProps {
  projectId: string;
  projectName: string;
}

interface DocMeta {
  type: DocType;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const DOCS: DocMeta[] = [
  {
    type: "pitch-deck",
    title: "Pitch Deck",
    description: "Apresentação executiva do projeto para investidores.",
    Icon: Presentation,
  },
  {
    type: "business-plan",
    title: "Plano de Negócios",
    description: "Documento completo cobrindo estratégia, mercado e operação.",
    Icon: BookOpen,
  },
  {
    type: "executive-summary",
    title: "Resumo Executivo",
    description: "Síntese objetiva dos principais pontos do projeto.",
    Icon: FileText,
  },
];

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function DocumentacaoClient({ projectId, projectName }: DocumentacaoClientProps) {
  const router = useRouter();
  const [cache, setCache] = useState<GeneratedDocSummary[]>([]);
  const [generating, setGenerating] = useState<DocType | null>(null);
  const [downloading, setDownloading] = useState<DocType | null>(null);

  useEffect(() => {
    if (!projectId) return;
    listGeneratedDocuments(projectId).then(setCache).catch(() => {});
  }, [projectId]);

  const getEntry = (t: DocType) => cache.find(c => c.doc_type === t);

  const refreshCache = async () => {
    const next = await listGeneratedDocuments(projectId);
    setCache(next);
  };

  const handleGenerate = async (docType: DocType) => {
    setGenerating(docType);
    try {
      await generateFinalDocument(projectId, docType);
      toast.success("Documento gerado!");
      await refreshCache();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar documento");
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = async (docType: DocType) => {
    setDownloading(docType);
    try {
      const slug = slugify(projectName);
      await downloadFinalDocumentPdf(
        projectId,
        docType,
        `IdeorAI-${slug}-${docType}.pdf`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao baixar PDF");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-ink-primary">Documentação Final</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gere documentos profissionais para apresentar seu projeto.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {DOCS.map(({ type, title, description, Icon }) => {
          const entry = getEntry(type);
          const isGenerating = generating === type;
          const isDownloading = downloading === type;
          const status = isGenerating
            ? { label: "Gerando...", cls: "bg-amber-100 text-amber-800" }
            : entry
              ? {
                  label: `Pronto · ${formatDate(entry.generated_at)}`,
                  cls: "bg-emerald-100 text-emerald-800",
                }
              : { label: "Não gerado", cls: "bg-muted text-muted-foreground" };

          return (
            <Card
              key={type}
              className="border-primary/20 transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-center justify-center">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <h2 className="text-base font-bold text-ink-primary">{title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex justify-center">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      status.cls
                    )}
                  >
                    {status.label}
                  </span>
                </div>

                {!entry ? (
                  <Button
                    onClick={() => handleGenerate(type)}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      "Gerar"
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => handleDownload(type)}
                      disabled={isDownloading}
                      className="w-full"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Baixando...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Baixar PDF
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleGenerate(type)}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Regenerando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Regenerar
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
