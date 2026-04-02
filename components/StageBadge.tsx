"use client";

import { AlertCircle, RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StageBadgeStatus = 'valid' | 'pending' | 'invalidated' | 'not-started';

interface StageBadgeProps {
  status: StageBadgeStatus;
  showLabel?: boolean;
  className?: string;
}

export function StageBadge({
  status,
  showLabel = true,
  className,
}: StageBadgeProps) {
  const config = {
    valid: {
      icon: Check,
      label: 'OK',
      className: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
    },
    pending: {
      icon: AlertCircle,
      label: 'Contexto pendente',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
    },
    invalidated: {
      icon: RefreshCw,
      label: 'Precisa ser regerada',
      className: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
    },
    'not-started': {
      icon: null,
      label: '',
      className: 'hidden',
    },
  };

  const { icon: Icon, label, className: statusClassName } = config[status];

  if (status === 'not-started' || !showLabel) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border",
        statusClassName,
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </span>
  );
}
