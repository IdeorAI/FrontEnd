'use client';

import { useState, useEffect } from 'react';
import { GoPivotResponse, triggerGoPivot, getGoPivot } from '@/lib/api/go-pivot';
import { ChevronDown, Sparkles, CheckCircle2, ArrowUpRight, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  projectId: string;
  userId: string;
  etapa2Complete: boolean;
  initial?: GoPivotResponse | null;
}

type CardState = 'disabled' | 'idle' | 'loading' | 'result';

export function GoPivotCard({ projectId, userId, etapa2Complete, initial }: Props) {
  const [cardState, setCardState] = useState<CardState>(
    !etapa2Complete ? 'disabled' : initial ? 'result' : 'idle'
  );
  const [result, setResult] = useState<GoPivotResponse | null>(initial ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    if (etapa2Complete && cardState === 'disabled') {
      setCardState(initial ? 'result' : 'idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapa2Complete]);

  useEffect(() => {
    if (
      !etapa2Complete ||
      result !== null ||
      cardState === 'loading' ||
      hasAttemptedFetch
    ) {
      return;
    }
    setHasAttemptedFetch(true);
    let cancelled = false;
    (async () => {
      try {
        const cached = await getGoPivot(projectId, userId);
        if (cancelled || !cached) return;
        setResult(cached);
        setCardState('result');
      } catch (err) {
        console.warn('Falha ao carregar avaliação cacheada:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapa2Complete, projectId, userId]);

  async function evaluate() {
    setCardState('loading');
    setError(null);
    try {
      const data = await triggerGoPivot(projectId, userId);
      setResult(data);
      setCardState('result');
      setIsOpen(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao avaliar. Tente novamente.');
      setCardState(result ? 'result' : 'idle');
    }
  }

  const positives = result?.positivePoints?.length
    ? result.positivePoints
    : (result?.verdict === 'GO' ? result.reasons : []);
  const improvements = result?.improvementPoints?.length
    ? result.improvementPoints
    : (result?.pivotRecommendations?.length
        ? result.pivotRecommendations
        : (result?.verdict === 'PIVOT' ? result.reasons : []));

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => cardState === 'result' && setIsOpen((v) => !v)}
        disabled={cardState !== 'result'}
        className={cn(
          'w-full px-6 py-4 flex items-center gap-3 text-left transition',
          cardState === 'disabled' ? 'bg-muted/60 cursor-not-allowed' : 'bg-muted/40',
          cardState === 'result' && 'hover:bg-muted/60 cursor-pointer'
        )}
      >
        <Sparkles className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Avaliação da sua ideia</h3>
          <p className="text-xs text-muted-foreground">
            {cardState === 'disabled' && 'Complete a Etapa 2 para habilitar'}
            {cardState === 'idle' && 'Receba pontos positivos e a melhorar'}
            {cardState === 'loading' && 'Analisando sua ideia…'}
            {cardState === 'result' && result && `Atualizado em ${new Date(result.createdAt).toLocaleDateString('pt-BR')}`}
          </p>
        </div>
        {cardState === 'result' && (
          <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
        )}
      </button>

      {cardState === 'disabled' && (
        <div className="px-6 py-5 text-sm text-muted-foreground">
          Gere o documento da Etapa 2 primeiro. Em seguida, geramos uma avaliação com pontos positivos e pontos a melhorar.
        </div>
      )}

      {cardState === 'idle' && (
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            Receba uma análise estruturada com pontos positivos da sua ideia e oportunidades acionáveis de melhoria.
          </p>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}
          <Button onClick={evaluate} className="gap-2">
            <Sparkles className="w-4 h-4" /> Avaliar minha ideia
          </Button>
        </div>
      )}

      {cardState === 'loading' && (
        <div className="px-6 py-5 flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Analisando sua ideia… isso pode levar até 30 segundos.
        </div>
      )}

      {cardState === 'result' && result && isOpen && (
        <div className="px-6 py-5 space-y-5 border-t">
          <section>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">
              Pontos positivos
            </p>
            {positives.length > 0 ? (
              <ul className="space-y-1.5">
                {positives.map((p, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sem pontos positivos destacados nesta avaliação.</p>
            )}
          </section>

          <section>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2">
              Pontos a melhorar
            </p>
            {improvements.length > 0 ? (
              <ul className="space-y-1.5">
                {improvements.map((p, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <ArrowUpRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Nada crítico a melhorar nesta avaliação.</p>
            )}
          </section>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="space-y-2">
            {typeof result.usageCount === 'number' && (
              <p className="text-xs text-muted-foreground">
                {result.usageCount} / {result.usageLimit ?? 3} avaliações usadas
              </p>
            )}
            {(() => {
              const limitReached =
                typeof result.usageCount === 'number' &&
                result.usageCount >= (result.usageLimit ?? 3);
              return (
                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={evaluate}
                    disabled={limitReached}
                    className="gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reavaliar
                  </Button>
                  {limitReached && (
                    <p className="text-xs text-muted-foreground italic">
                      Limite de avaliações atingido para este projeto.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </Card>
  );
}
