// components/first-time-tooltip.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { markTooltipSeen } from "@/lib/supabase/update-seen-tooltip";

interface FirstTimeTooltipProps {
  // Chave única para este tooltip (ex: "ideia_descricao")
  tooltipKey: string;
  // Se true, o tooltip já foi visto (passado pelo Server Component pai)
  jaVisto: boolean;
  // Mensagem exibida no tooltip
  mensagem: string;
  children: React.ReactNode;
}

export function FirstTimeTooltip({
  tooltipKey,
  jaVisto,
  mensagem,
  children,
}: FirstTimeTooltipProps) {
  const [aberto, setAberto] = useState(false);
  const [descartado, setDescartado] = useState(jaVisto);

  // Abre automaticamente após 500ms na primeira visita (desktop only)
  useEffect(() => {
    if (descartado) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const timer = setTimeout(() => setAberto(true), 500);
    return () => clearTimeout(timer);
  }, [descartado]);

  function fechar() {
    setAberto(false);
    setDescartado(true);
    markTooltipSeen(tooltipKey);
  }

  if (descartado) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip open={aberto} onOpenChange={(open) => !open && fechar()}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs text-sm p-3 cursor-pointer"
          onClick={fechar}
        >
          <p>{mensagem}</p>
          <p className="text-xs text-muted-foreground mt-1">Clique para fechar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
