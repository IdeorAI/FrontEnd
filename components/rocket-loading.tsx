// components/rocket-loading.tsx
"use client";

import { Rocket } from "lucide-react";
import { useEffect, useState } from "react";

interface RocketLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function RocketLoading({
  message = "Loading...",
  fullScreen = true,
}: RocketLoadingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Foguete com animações */}
      <div className="relative">
        {/* Círculo pulsante de fundo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-[#8c7dff]/20 animate-ping" />
        </div>

        {/* Foguete principal */}
        <div className="relative z-10 animate-bounce-slow">
          <Rocket
            className="h-16 w-16 text-[#8c7dff] -rotate-45 drop-shadow-2xl"
            strokeWidth={2}
          />
          {/* Rastro do foguete */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-8 bg-gradient-to-t from-[#8c7dff]/60 to-transparent blur-sm animate-pulse" />
        </div>
      </div>

      {/* Texto de loading */}
      <div className="text-center">
        <p className="text-xl font-semibold text-foreground animate-pulse">
          {message}
        </p>
        {/* Pontos animados */}
        <div className="flex gap-1 justify-center mt-2">
          <span className="h-2 w-2 rounded-full bg-[#8c7dff] animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-[#8c7dff] animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 rounded-full bg-[#8c7dff] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12">{content}</div>
  );
}

// Versão inline menor para usar em botões ou cards
export function RocketLoadingInline({ className }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className || ""}`}>
      <Rocket className="h-4 w-4 text-[#8c7dff] -rotate-45 animate-bounce" />
      <span className="text-sm text-muted-foreground">Carregando...</span>
    </div>
  );
}
