"use client";

import { useState } from "react";
import { Sparkles, Save, RefreshCw, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AIStageCardProps {
  title: string;
  description: string;
  placeholder?: string;
  onGenerate: (idea: string) => Promise<string>;
  onSave: (content: string) => Promise<void>;
  existingContent?: string;
  initialIdea?: string;
}

export function AIStageCard({
  title,
  description,
  placeholder = "Descreva sua ideia de negócio aqui...",
  onGenerate,
  onSave,
  existingContent,
  initialIdea = "",
}: AIStageCardProps) {
  const [idea, setIdea] = useState(initialIdea);
  const [generatedContent, setGeneratedContent] = useState(existingContent || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim()) {
      alert("Por favor, insira uma ideia antes de gerar.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await onGenerate(idea);
      setGeneratedContent(result);

      // ✨ NOVO: Salvar automaticamente após gerar
      console.log("[AIStageCard] Conteúdo gerado, salvando automaticamente...");
      try {
        await onSave(result);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        console.log("[AIStageCard] ✓ Conteúdo salvo automaticamente com sucesso!");
      } catch (saveError) {
        console.error("[AIStageCard] Erro ao salvar automaticamente:", saveError);
        alert("Conteúdo gerado com sucesso, mas não foi salvo automaticamente. Use o botão Editar para salvar manualmente.");
      }
    } catch (error) {
      console.error("Erro detalhado ao gerar:", error);

      // Mensagem de erro mais detalhada
      let errorMessage = "Erro ao gerar conteúdo com IA.";

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage += "\n\nProblema de conexão com o servidor. Verifique:\n" +
                       "- Se o backend está rodando\n" +
                       "- Se a variável NEXT_PUBLIC_API_URL está configurada\n" +
                       "- Se há problemas de rede ou CORS";
      } else if (error instanceof Error) {
        errorMessage += `\n\nDetalhes: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    const contentToSave = isEditing ? editedContent : generatedContent;

    if (!contentToSave.trim()) {
      alert("Não há conteúdo para salvar.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(contentToSave);
      setGeneratedContent(contentToSave);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar conteúdo. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = () => {
    setEditedContent(generatedContent);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  // Função auxiliar para renderizar valores recursivamente
  const renderValue = (value: unknown, depth: number = 0): React.ReactNode => {
    // String simples
    if (typeof value === "string") {
      return <p className="text-sm leading-relaxed">{value}</p>;
    }

    // Número ou booleano
    if (typeof value === "number" || typeof value === "boolean") {
      return <p className="text-sm font-medium">{String(value)}</p>;
    }

    // Null ou undefined
    if (value === null || value === undefined) {
      return <p className="text-sm text-muted-foreground italic">Não definido</p>;
    }

    // Array
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside space-y-1 ml-2">
          {value.map((item, index) => (
            <li key={index} className="text-sm">
              {typeof item === "object" && item !== null ? (
                <div className="ml-4 mt-1">{renderValue(item, depth + 1)}</div>
              ) : (
                <span>{String(item)}</span>
              )}
            </li>
          ))}
        </ul>
      );
    }

    // Objeto aninhado
    if (typeof value === "object" && value !== null) {
      return (
        <div className={`space-y-3 ${depth > 0 ? "ml-4 pl-3 border-l border-muted" : ""}`}>
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <h5 className="font-medium text-sm text-foreground mb-1 capitalize">
                {subKey.replace(/_/g, " ")}:
              </h5>
              {renderValue(subValue, depth + 1)}
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-sm">{String(value)}</p>;
  };

  const renderContent = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      return (
        <div className="space-y-6">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="border-l-4 border-primary/30 pl-4 py-2">
              <h4 className="font-bold text-base mb-3 capitalize text-foreground">
                {key.replace(/_/g, " ")}
              </h4>
              <div>{renderValue(value)}</div>
            </div>
          ))}
        </div>
      );
    } catch {
      // Se não for JSON válido, exibir como texto simples
      return (
        <div className="bg-muted/50 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm font-sans">{jsonString}</pre>
        </div>
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input da ideia */}
        {!generatedContent && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Ideia de Negócio</label>
            <Textarea
              placeholder={placeholder}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={4}
              className="resize-none lg:min-h-[200px]"
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !idea.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Gerando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar com IA
                </>
              )}
            </Button>
          </div>
        )}

        {/* Conteúdo gerado */}
        {generatedContent && !isEditing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Conteúdo Gerado</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartEdit}
              >
                <Edit2 className="mr-2 h-3 w-3" />
                Ajustar
              </Button>
            </div>
            <div className="border rounded-lg p-4 bg-card max-h-96 overflow-y-auto">
              {renderContent(generatedContent)}
            </div>
            {showSuccess && (
              <div className="bg-green-100 dark:bg-green-900/20 border border-green-500 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span>Conteúdo gerado e salvo automaticamente com sucesso!</span>
              </div>
            )}
          </div>
        )}

        {/* Modo de edição */}
        {isEditing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Ajustar Conteúdo</h3>
            </div>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={12}
              className="font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Ajustes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
