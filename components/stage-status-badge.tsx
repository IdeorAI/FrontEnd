"use client";

import { AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StageStatusBadgeProps {
  status: "valid" | "pending" | "invalidated";
  message?: string;
  className?: string;
}

export function StageStatusBadge({
  status,
  message,
  className,
}: StageStatusBadgeProps) {
  const config = {
    valid: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      iconColor: "text-green-500",
      defaultMessage: "Contexto salvo",
    },
    pending: {
      icon: AlertCircle,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      iconColor: "text-amber-500",
      defaultMessage: "Contexto pendente",
    },
    invalidated: {
      icon: RefreshCw,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      iconColor: "text-red-500",
      defaultMessage: "Precisa ser regerado",
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor, defaultMessage } =
    config[status];

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-lg border",
        bgColor,
        borderColor,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", iconColor)} />
      <span className={cn("text-sm font-medium", textColor)}>
        {message || defaultMessage}
      </span>
    </div>
  );
}
