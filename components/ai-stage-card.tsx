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
      setShowSuccess(false);
    } catch (error) {
      console.error("Erro ao gerar:", error);
      alert("Erro ao gerar conteúdo com IA. Tente novamente.");
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

  const renderContent = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      return (
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="border-l-2 border-primary pl-4">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
                {key.replace(/_/g, " ")}
              </h4>
              <div className="text-sm">
                {typeof value === "object" && value !== null ? (
                  <pre className="whitespace-pre-wrap bg-muted p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <p>{String(value)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    } catch {
      return (
        <div className="bg-muted p-4 rounded">
          <pre className="whitespace-pre-wrap text-sm">{jsonString}</pre>
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
              className="resize-none"
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
                    Salvar no Supabase
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setGeneratedContent("");
                  setIdea("");
                }}
              >
                Gerar Novamente
              </Button>
            </div>
            {showSuccess && (
              <div className="bg-green-100 dark:bg-green-900/20 border border-green-500 text-green-700 dark:text-green-400 px-4 py-3 rounded">
                ✓ Conteúdo salvo com sucesso!
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
