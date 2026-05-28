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
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background/95 backdrop-blur-sm">
      <style>{`
        @keyframes gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes rocket-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        .phrase-gradient {
          background: linear-gradient(90deg, #8c7dff, #c4b5fd, #a78bfa, #7c6ff7, #8c7dff);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 4s ease infinite;
        }
        .rocket-float {
          animation: rocket-float 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* Foguete */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-[#8c7dff]/15 animate-ping" />
        </div>
        <div className="relative z-10 rocket-float">
          <Rocket className="h-14 w-14 text-[#8c7dff] drop-shadow-2xl -rotate-45" strokeWidth={1.75} />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-10 bg-gradient-to-b from-[#8c7dff]/50 to-transparent blur-sm" />
        </div>
      </div>

      {/* Frase dinâmica */}
      <div
        role="status"
        aria-live="polite"
        aria-label="Gerando conteúdo com IA"
        className="flex flex-col items-center gap-3 px-8 max-w-md text-center"
        style={{
          opacity: isFading ? 0 : 1,
          transform: isFading ? "translateY(-10px)" : "translateY(0px)",
          transition: "opacity 400ms ease-in-out, transform 400ms ease-in-out",
        }}
      >
        <p className="phrase-gradient text-xl font-semibold tracking-tight leading-snug">
          {phrase}
        </p>

        {/* Dots */}
        <div className="flex gap-1.5 justify-center mt-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8c7dff]/70 animate-bounce [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#8c7dff]/70 animate-bounce [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#8c7dff]/70 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
