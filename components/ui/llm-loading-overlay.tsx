"use client";

import { useState, useEffect } from "react";
import { Rocket } from "lucide-react";
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
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm">
      {/* Foguete — mesma animação do RocketLoading */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-[#8c7dff]/20 animate-ping" />
        </div>
        <div className="relative z-10 animate-bounce">
          <Rocket
            className="h-16 w-16 text-[#8c7dff] drop-shadow-2xl"
            strokeWidth={2}
          />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-8 bg-gradient-to-t from-[#8c7dff]/60 to-transparent blur-sm animate-pulse" />
        </div>
      </div>

      {/* Frase rotativa */}
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
        <div className="flex gap-1 justify-center mt-2">
          <span className="h-2 w-2 rounded-full bg-[#8c7dff] animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-[#8c7dff] animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-[#8c7dff] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
