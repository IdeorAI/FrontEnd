"use client";

import type { LucideIcon } from "lucide-react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  highlights?: string[];
}

export function MockupCard({ icon: Icon, title, description, highlights }: Props) {
  return (
    <Card className="relative p-6 space-y-4 overflow-hidden">
      <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary/15 border border-primary/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
        <Clock className="w-3 h-3" /> Em breve
      </span>
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      {highlights && highlights.length > 0 && (
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {highlights.map((h, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </Card>
  );
}
