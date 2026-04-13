"use client";

import { useState, useEffect } from "react";
import { Sparkles, Save, RefreshCw, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { jsonToToon, toonToJson } from "@/lib/toon-converter";
import { toast } from "sonner";
import { RocketLoading } from "@/components/rocket-loading";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debugLog = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") console.log(...args);
};

interface AIStageCardProps {
  title: string;
  description: string;
  placeholder?: string;
  onGenerate: (idea: string) => Promise<string>;
  onSave: (content: string) => Promise<void>;
  existingContent?: string;
  initialIdea?: string;
  storageKey?: string; // Chave para persistir o input no localStorage (ex: "{projectId}_etapa1")
  nextStageId?: string; // ID da próxima etapa (ex: "etapa2")
  nextStageTitle?: string; // Título da próxima etapa (ex: "Pesquisa de Mercado")
  onGoToNextStage?: () => void; // Callback para navegar para próxima etapa
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
  // 🆕 SPRINT 15: Usa TOON ao invés de JSON para edição mais amigável
  const [editValue, setEditValue] = useState(jsonToToon(value));

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
            aria-label={isExpanded ? `Recolher seção ${sectionKey.replace(/_/g, ' ')}` : `Expandir seção ${sectionKey.replace(/_/g, ' ')}`}
            aria-expanded={isExpanded}
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
          aria-label={isEditingField ? `Cancelar edição de ${sectionKey.replace(/_/g, ' ')}` : `Editar seção ${sectionKey.replace(/_/g, ' ')}`}
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
                placeholder="Edite o conteúdo em formato TOON (mais legível que JSON)"
              />
              <p className="text-xs text-muted-foreground">
                💡 Formato TOON - mais fácil de editar que JSON!
              </p>
              <Button
                size="sm"
                onClick={() => {
                  try {
                    // 🆕 SPRINT 15: Converte TOON → JSON antes de salvar
                    const parsed = toonToJson(editValue);
                    onChange(sectionKey, parsed);
                    setIsEditingField(false);
                  } catch {
                    toast.error("Formato TOON inválido. Por favor, verifique a sintaxe.");
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
  storageKey,
  nextStageId,
  nextStageTitle,
  onGoToNextStage,
}: AIStageCardProps) {
  const [idea, setIdea] = useState(() => {
    if (storageKey && typeof window !== "undefined") {
      return localStorage.getItem(storageKey) ?? initialIdea;
    }
    return initialIdea;
  });
  const [generatedContent, setGeneratedContent] = useState(existingContent || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJson, setEditedJson] = useState<Record<string, unknown>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Persiste o input do usuário no localStorage para não perder ao navegar entre etapas
  useEffect(() => {
    if (!storageKey) return;
    if (idea) {
      localStorage.setItem(storageKey, idea);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [idea, storageKey]);

  const handleGenerate = async () => {
    if (!idea.trim()) {
      toast.error("Por favor, insira uma ideia antes de gerar.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await onGenerate(idea);

      // 🆕 SPRINT 15: Converte JSON → TOON antes de salvar
      let contentToSave = result;
      try {
        // Remove markdown code blocks antes de parsear
        let cleanedJson = result.trim();

        if (cleanedJson.startsWith('```json')) {
          cleanedJson = cleanedJson.substring(7);
          debugLog("[AIStageCard] Removido marcador ```json do início");
        } else if (cleanedJson.startsWith('```')) {
          cleanedJson = cleanedJson.substring(3);
          debugLog("[AIStageCard] Removido marcador ``` do início");
        }

        if (cleanedJson.endsWith('```')) {
          cleanedJson = cleanedJson.substring(0, cleanedJson.length - 3);
          debugLog("[AIStageCard] Removido marcador ``` do final");
        }

        cleanedJson = cleanedJson.trim();

        const parsed = JSON.parse(cleanedJson);
        contentToSave = jsonToToon(parsed);
        debugLog("[AIStageCard] ✓ Conteúdo convertido para TOON");
      } catch (error) {
        debugLog("[AIStageCard] Conteúdo não é JSON válido, salvando como está:", error);
      }

      setGeneratedContent(contentToSave);

      // ✨ NOVO: Salvar automaticamente após gerar
      debugLog("[AIStageCard] Conteúdo gerado, salvando automaticamente...");
      try {
        await onSave(contentToSave);
        if (storageKey) localStorage.removeItem(storageKey);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        debugLog("[AIStageCard] ✓ Conteúdo salvo automaticamente com sucesso!");
      } catch (saveError) {
        console.error("[AIStageCard] Erro ao salvar automaticamente:", saveError);
        toast.warning("Conteúdo gerado, mas não foi salvo automaticamente. Use o botão Ajustar para salvar manualmente.");
      }
    } catch (error) {
      console.error("Erro detalhado ao gerar:", error);

      // Mensagem de erro mais detalhada
      let errorMessage = "Erro ao gerar conteúdo com IA.";

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Problema de conexão com o servidor. Verifique se o backend está rodando e se a variável NEXT_PUBLIC_API_URL está configurada.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartEdit = () => {
    try {
      // 🆕 SPRINT 15: Tenta converter TOON → JSON para editor visual
      const parsed = toonToJson(generatedContent);
      setEditedJson(parsed as Record<string, unknown>);
      debugLog("[AIStageCard] ✓ Conteúdo TOON convertido para edição");
    } catch {
      // Se não for TOON válido, tenta JSON
      try {
        const cleaned = generatedContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        setEditedJson(parsed);
        debugLog("[AIStageCard] Conteúdo JSON parseado para edição");
      } catch {
        debugLog("[AIStageCard] Conteúdo em formato desconhecido, usando fallback");
        setEditedJson({ raw: generatedContent });
      }
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
    // 🆕 SPRINT 15: Converte JSON → TOON antes de salvar
    const toonString = jsonToToon(editedJson);
    setIsSaving(true);
    try {
      await onSave(toonString);
      if (storageKey) localStorage.removeItem(storageKey);
      setGeneratedContent(toonString);
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      debugLog("[AIStageCard] ✓ Edição salva em formato TOON");
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      toast.error("Erro ao salvar alterações. Tente novamente.");
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

  const renderContent = (contentString: string) => {
    try {
      debugLog("[AIStageCard] Tentando renderizar conteúdo. Comprimento:", contentString.length);
      debugLog("[AIStageCard] Primeiros 200 caracteres:", contentString.substring(0, 200));

      // 🆕 SPRINT 15: Tenta converter TOON → JSON primeiro
      let data;
      try {
        data = toonToJson(contentString);
        debugLog("[AIStageCard] ✓ Conteúdo TOON parseado com sucesso");
      } catch {
        // Se não for TOON, tenta JSON
        debugLog("[AIStageCard] Não é TOON, tentando JSON...");

        // Remover markdown code blocks (```json ... ```)
        let cleanedJson = contentString.trim();

        // Remover ```json do início
        if (cleanedJson.startsWith('```json')) {
          cleanedJson = cleanedJson.substring(7); // Remove "```json"
          debugLog("[AIStageCard] ⚠️ Removido marcador ```json do início");
        } else if (cleanedJson.startsWith('```')) {
          cleanedJson = cleanedJson.substring(3); // Remove "```"
          debugLog("[AIStageCard] ⚠️ Removido marcador ``` do início");
        }

        // Remover ``` do final
        if (cleanedJson.endsWith('```')) {
          cleanedJson = cleanedJson.substring(0, cleanedJson.length - 3);
          debugLog("[AIStageCard] ⚠️ Removido marcador ``` do final");
        }

        cleanedJson = cleanedJson.trim();
        debugLog("[AIStageCard] JSON limpo. Novos primeiros 100 caracteres:", cleanedJson.substring(0, 100));

        data = JSON.parse(cleanedJson);
      }
      debugLog("[AIStageCard] ✓ JSON parseado com sucesso. Chaves:", Object.keys(data));

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
      debugLog("[AIStageCard] Conteúdo que causou erro:", contentString);

      // Se não for JSON válido, exibir como texto simples
      return (
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Formato não-JSON detectado. Exibindo texto bruto:</p>
          <pre className="whitespace-pre-wrap text-sm font-sans">{contentString}</pre>
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
            {isGenerating ? (
              <RocketLoading
                fullScreen={false}
                message="Gerando análise com IA... (30-60s)"
              />
            ) : (
              <>
                <label htmlFor={`idea-input-${title}`} className="text-sm font-medium">Ideia de Negócio</label>
                <Textarea
                  id={`idea-input-${title}`}
                  placeholder={placeholder}
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={4}
                  className="resize-none lg:min-h-[200px]"
                  aria-label="Descreva sua ideia de negócio"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={!idea.trim()}
                  className="w-full"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar com IA
                </Button>
              </>
            )}
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
                aria-label="Ajustar conteúdo gerado"
              >
                <Edit2 className="mr-2 h-3 w-3" />
                Ajustar
              </Button>
            </div>
            <div className="border rounded-lg p-4 bg-card max-h-96 overflow-y-auto">
              {renderContent(generatedContent)}
            </div>

            {/* Mensagem de sucesso (temporária) */}
            {showSuccess && (
              <div className="bg-green-100 dark:bg-green-900/20 border border-green-500 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span>Conteúdo gerado e salvo automaticamente com sucesso!</span>
              </div>
            )}

            {/* Botão para ir para próxima etapa - SEMPRE VISÍVEL quando há conteúdo */}
            {nextStageId && nextStageTitle && onGoToNextStage && (
              <Button
                onClick={onGoToNextStage}
                className="w-full bg-gradient-hero text-[#1e2830] font-semibold hover:shadow-glow"
                size="lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Ir para próxima etapa: {nextStageTitle} →
              </Button>
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
