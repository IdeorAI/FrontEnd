"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, Rocket } from "lucide-react";
import { generateMvpPrompt } from "@/lib/utils/mvp-prompt";

interface Props {
  projectName: string;
  projectCategory: string | null;
  stage5Content: string | null;
}

const NOCODE_TOOLS = [
  { name: "Lovable", url: "https://lovable.dev" },
  { name: "Bolt", url: "https://bolt.new" },
  { name: "v0", url: "https://v0.dev" },
];

export function MvpPromptPanel({ projectName, projectCategory, stage5Content }: Props) {
  const [copied, setCopied] = useState(false);

  if (!stage5Content?.trim()) return null;

  const prompt = generateMvpPrompt(projectName, projectCategory, stage5Content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border rounded-lg p-6 space-y-4 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex items-center gap-2">
        <Rocket className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-primary">Construir seu MVP</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Use o prompt abaixo em ferramentas NoCode para criar seu produto sem código.
      </p>

      {/* Área do prompt */}
      <div className="relative">
        <pre className="text-sm bg-background border rounded-md p-4 whitespace-pre-wrap max-h-48 overflow-y-auto font-sans leading-relaxed">
          {prompt}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copiar prompt
            </>
          )}
        </button>
      </div>

      {/* Botões de atalho */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center">Abrir em:</span>
        {NOCODE_TOOLS.map((tool) => (
          <a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-md hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            {tool.name}
          </a>
        ))}
      </div>
    </div>
  );
}
