"use client";
import { useState, lazy, Suspense } from "react";
import { MessageSquarePlus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/supabase/use-user";

const BetaFeedbackModal = lazy(() =>
  import("./beta-feedback-modal").then((m) => ({ default: m.BetaFeedbackModal }))
);

export function BetaFeedbackFab() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useUser();

  if (loading || !user) return null;

  return (
    <>
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Enviar feedback"
              className={cn(
                // -15% (h-14→h-12) e ~meio da tela, empilhado ACIMA do chat-fab
                // (chat fica em top-1/2; este ~60px acima).
                "fixed top-[calc(50%-3.75rem)] -translate-y-1/2 right-5 z-50 h-12 w-12 rounded-full",
                "bg-primary text-primary-foreground shadow-lg",
                "flex items-center justify-center",
                "transition-transform hover:scale-105 hover:bg-primary/90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              <MessageSquarePlus className="h-5 w-5" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Enviar feedback</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {open && (
        <Suspense fallback={null}>
          <BetaFeedbackModal open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
}
