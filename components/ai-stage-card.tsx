"use client";

import { useState } from "react";
import { Sparkles, Save, RefreshCw, Edit2, ChevronDown, ChevronUp } from "lucide-react";
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

// Componente auxiliar para edição visual de seções
interface EditableSectionProps {
  sectionKey: string;
  value: unknown;
  onChange: (key: string, newValue: unknown) => void;
}

function EditableSection({ sectionKey, value, onChange }: EditableSectionProps) {
  const [isEditingField, setIsEditingField] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [editValue, setEditValue] = useState(JSON.stringify(value, null, 2));

  const renderValue = (val: unknown): React.ReactNode => {
    if (typeof val === 'string') {
      return <p className="text-sm leading-relaxed">{val}</p>;
    }
    if (typeof val === 'number' || typeof val === 'boolean') {
      return <p className="text-sm font-medium">{String(val)}</p>;
    }
    if (Array.isArray(val)) {
      return (
        <ul className="list-disc list-inside space-y-1 ml-2">
          {val.map((item, i) => (
            <li key={i} className="text-sm">{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
          ))}
        </ul>
      );
    }
    if (typeof val === 'object' && val !== null) {
      return (
        <div className="space-y-2 ml-2">
          {Object.entries(val).map(([k, v]) => (
            <div key={k} className="border-l-2 border-muted pl-2">
              <strong className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, ' ')}:</strong>
              <div className="mt-1">{renderValue(v)}</div>
            </div>
          ))}
        </div>
      );
    }
    return <span className="text-sm">{String(val)}</span>;
  };

  return (
    <div className="border border-muted rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <h4 className="text-sm font-semibold text-primary capitalize">
            {sectionKey.replace(/_/g, ' ')}
          </h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditingField(!isEditingField)}
          className="h-7 text-xs"
        >
          {isEditingField ? "Cancelar" : "Editar"}
        </Button>
      </div>

      {isExpanded && (
        <>
          {isEditingField ? (
            <div className="space-y-2">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="min-h-[100px] font-mono text-xs"
                placeholder="Edite o conteúdo desta seção (formato JSON)"
              />
              <Button
                size="sm"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(editValue);
                    onChange(sectionKey, parsed);
                    setIsEditingField(false);
                  } catch {
                    alert("JSON inválido. Por favor, verifique a sintaxe.");
                  }
                }}
                className="w-full"
              >
                <Save className="mr-2 h-3 w-3" />
                Salvar Seção
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground pl-8">
              {renderValue(value)}
            </div>
          )}
        </>
      )}
    </div>
  );
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
  const [editedJson, setEditedJson] = useState<Record<string, unknown>>({});
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

  const handleStartEdit = () => {
    try {
      // Tenta parsear como JSON para editor visual
      const cleaned = generatedContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setEditedJson(parsed);
    } catch {
      // Se não for JSON válido, usa objeto vazio
      console.log("[AIStageCard] Conteúdo não é JSON válido, usando editor de texto");
      setEditedJson({ raw: generatedContent });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedJson({});
  };

  const handleUpdateSection = (key: string, newValue: unknown) => {
    setEditedJson((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  const handleSaveVisualEdit = async () => {
    const jsonString = JSON.stringify(editedJson, null, 2);
    setIsSaving(true);
    try {
      await onSave(jsonString);
      setGeneratedContent(jsonString);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      alert("Erro ao salvar alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
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
      console.log("[AIStageCard] Tentando parsear JSON. Comprimento:", jsonString.length);
      console.log("[AIStageCard] Primeiros 200 caracteres:", jsonString.substring(0, 200));

      // ✨ NOVO: Remover markdown code blocks (```json ... ```)
      let cleanedJson = jsonString.trim();

      // Remover ```json do início
      if (cleanedJson.startsWith('```json')) {
        cleanedJson = cleanedJson.substring(7); // Remove "```json"
        console.log("[AIStageCard] ⚠️ Removido marcador ```json do início");
      } else if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.substring(3); // Remove "```"
        console.log("[AIStageCard] ⚠️ Removido marcador ``` do início");
      }

      // Remover ``` do final
      if (cleanedJson.endsWith('```')) {
        cleanedJson = cleanedJson.substring(0, cleanedJson.length - 3);
        console.log("[AIStageCard] ⚠️ Removido marcador ``` do final");
      }

      cleanedJson = cleanedJson.trim();
      console.log("[AIStageCard] JSON limpo. Novos primeiros 100 caracteres:", cleanedJson.substring(0, 100));

      const data = JSON.parse(cleanedJson);
      console.log("[AIStageCard] ✓ JSON parseado com sucesso. Chaves:", Object.keys(data));

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
    } catch (error) {
      console.error("[AIStageCard] ❌ Erro ao parsear JSON:", error);
      console.log("[AIStageCard] Conteúdo que causou erro:", jsonString);

      // Se não for JSON válido, exibir como texto simples
      return (
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Formato não-JSON detectado. Exibindo texto bruto:</p>
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

        {/* Modo de edição visual */}
        {isEditing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Ajustar Conteúdo</h3>
              <span className="text-xs text-muted-foreground">
                Clique em &quot;Editar&quot; em cada seção para ajustar
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {Object.keys(editedJson).length > 0 ? (
                Object.entries(editedJson).map(([key, value]) => (
                  <EditableSection
                    key={key}
                    sectionKey={key}
                    value={value}
                    onChange={handleUpdateSection}
                  />
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma seção disponível para edição
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleSaveVisualEdit}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvando Alterações...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Todas Alterações
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
