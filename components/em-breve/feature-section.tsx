import { type LucideIcon, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FeatureSectionProps {
  icon: LucideIcon;
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
  preview: React.ReactNode;
}

export function FeatureSection({
  icon: Icon,
  name,
  tagline,
  description,
  bullets,
  preview,
}: FeatureSectionProps) {
  return (
    <Card className="border-border/50 bg-card/60">
      <CardContent className="p-8 space-y-6">
        {/* Hero strip */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold">{name}</span>
            <Badge className="bg-primary/15 border border-primary/25 text-primary hover:bg-primary/20 text-xs font-medium">
              Em breve
            </Badge>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-base font-semibold text-foreground/90 leading-snug">
          {tagline}
        </p>

        {/* Two-column body */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: description + bullets */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                O que é
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {description}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Como funciona
              </p>
              <ul className="space-y-2">
                {bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: preview */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 flex flex-col justify-center">
            {preview}
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center gap-4 pt-2 border-t border-border/30">
          <Button variant="outline" size="sm" disabled className="text-xs opacity-60">
            Notificar quando lançar
          </Button>
          <Link
            href="/contato"
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Sugerir uma funcionalidade
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
