"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  content: string; // JSON string
  onRegenerate?: () => void;
  onRefine?: (feedback: string) => void;
  isRegenerating?: boolean;
  isRefining?: boolean;
}

export function DocumentViewer({
  content,
  onRegenerate,
  onRefine,
  isRegenerating = false,
  isRefining = false,
}: DocumentViewerProps) {
  const [feedback, setFeedback] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  // Parse JSON content
  let parsedContent: any;
  try {
    parsedContent = JSON.parse(content);
  } catch {
    parsedContent = { error: "Conteúdo inválido" };
  }

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const renderValue = (value: any, depth = 0): JSX.Element => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Não definido</span>;
    }

    if (typeof value === "string") {
      return <span className="text-gray-700">{value}</span>;
    }

    if (typeof value === "number") {
      return <span className="text-blue-600 font-medium">{value}</span>;
    }

    if (typeof value === "boolean") {
      return (
        <span className="text-purple-600 font-medium">
          {value ? "Sim" : "Não"}
        </span>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic">Lista vazia</span>;
      }
      return (
        <ul className="list-disc list-inside space-y-1 ml-4">
          {value.map((item, index) => (
            <li key={index} className="text-sm">
              {renderValue(item, depth + 1)}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="space-y-2 ml-4">
          {Object.entries(value).map(([key, val]) => (
            <div key={key}>
              <button
                onClick={() => toggleSection(`${depth}-${key}`)}
                className="flex items-center gap-2 text-sm font-medium text-[#8c7dff] hover:text-[#7a6de6] transition-colors"
              >
                {expandedSections.has(`${depth}-${key}`) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
              {expandedSections.has(`${depth}-${key}`) && (
                <div className="mt-2 ml-6">
                  {renderValue(val, depth + 1)}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-gray-600">{String(value)}</span>;
  };

  const handleRefine = () => {
    if (feedback.trim() && onRefine) {
      onRefine(feedback);
      setFeedback("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Ações */}
      <div className="flex items-center gap-3">
        {onRegenerate && (
          <Button
            onClick={onRegenerate}
            disabled={isRegenerating}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw
              className={cn("w-4 h-4", isRegenerating && "animate-spin")}
            />
            {isRegenerating ? "Gerando..." : "Regenerar"}
          </Button>
        )}
      </div>

      {/* Conteúdo */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[#8c7dff]">
          Documento Gerado
        </h3>
        {parsedContent.error ? (
          <p className="text-red-600">{parsedContent.error}</p>
        ) : (
          <div className="space-y-4">{renderValue(parsedContent)}</div>
        )}
      </Card>

      {/* Refinamento */}
      {onRefine && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8c7dff]" />
            <h3 className="text-lg font-semibold text-[#8c7dff]">
              Refinar Documento
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Forneça feedback específico sobre o que deseja melhorar ou ajustar
            no documento.
          </p>
          <Textarea
            placeholder="Ex: Gostaria que a seção de mercado fosse mais detalhada, incluindo dados sobre..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button
            onClick={handleRefine}
            disabled={!feedback.trim() || isRefining}
            size="sm"
            className="gap-2 bg-[#8c7dff] hover:bg-[#7a6de6]"
          >
            <Sparkles className={cn("w-4 h-4", isRefining && "animate-pulse")} />
            {isRefining ? "Refinando..." : "Refinar com IA"}
          </Button>
        </Card>
      )}
    </div>
  );
}
