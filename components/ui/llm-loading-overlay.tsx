"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { LLM_LOADING_PHRASES } from "@/lib/llm-loading-phrases";
import { usePhraseRotation } from "@/hooks/use-phrase-rotation";

interface LlmLoadingOverlayProps {
  isVisible: boolean;
  phrases?: readonly string[];
}

export function LlmLoadingOverlay({
  isVisible,
  phrases = LLM_LOADING_PHRASES,
}: LlmLoadingOverlayProps) {
  // Delay de 300ms para evitar flash em respostas rápidas
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShouldShow(false);
      return;
    }
    const timer = setTimeout(() => setShouldShow(true), 300);
    return () => clearTimeout(timer);
  }, [isVisible]);

  const { phrase, isFading } = usePhraseRotation(phrases, shouldShow);

  if (!shouldShow) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm rounded-inherit">
      <Loader2 className="h-10 w-10 animate-spin text-[#8c7dff]" />
      <div
        role="status"
        aria-live="polite"
        aria-label="Gerando conteúdo com IA"
        className="text-center px-6 max-w-sm"
        style={{
          opacity: isFading ? 0 : 1,
          transition: "opacity 400ms ease-in-out",
        }}
      >
        <p className="text-lg font-medium text-foreground">{phrase}</p>
      </div>
    </div>
  );
}
