'use client';

import { useState } from 'react';
import { GoPivotResponse, triggerGoPivot, confirmOverride } from '@/lib/api/go-pivot';
import { Lock, Shield, Loader2, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface Props {
  projectId: string;
  userId: string;
  etapa2Complete: boolean;
  initial?: GoPivotResponse | null;
}

type CardState = 'disabled' | 'idle' | 'loading' | 'result';

export function GoPivotCard({ projectId, userId, etapa2Complete, initial }: Props) {
  const router = useRouter();
  const [cardState, setCardState] = useState<CardState>(
    !etapa2Complete ? 'disabled' : initial ? 'result' : 'idle'
  );
  const [result, setResult] = useState<GoPivotResponse | null>(initial ?? null);
  const [error, setError] = useState<string | null>(null);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [overriding, setOverriding] = useState(false);

  async function evaluate() {
    setCardState('loading');
    setError(null);
    try {
      const data = await triggerGoPivot(projectId, userId);
      setResult(data);
      setCardState('result');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao avaliar. Tente novamente.');
      setCardState('idle');
    }
  }

  async function handleOverrideConfirm() {
    setOverriding(true);
    try {
      await confirmOverride(projectId, userId);
      setShowOverrideDialog(false);
      router.push(`/projeto/${projectId}/fase2/etapa3`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao confirmar. Tente novamente.');
      setOverriding(false);
      setShowOverrideDialog(false);
    }
  }

  const isGo = result?.verdict === 'GO';

  return (
    <>
      <Card className="overflow-hidden">
        {/* Header strip */}
        <div
          className={`px-6 py-4 flex items-center gap-3 ${
            cardState === 'disabled'
              ? 'bg-muted/60'
              : cardState === 'result' && isGo
              ? 'bg-green-500/10 dark:bg-green-500/15'
              : cardState === 'result' && !isGo
              ? 'bg-destructive/10'
              : 'bg-primary/10'
          }`}
        >
          {cardState === 'disabled' && <Lock className="w-5 h-5 text-muted-foreground" />}
          {cardState === 'idle' && <Shield className="w-5 h-5 text-primary" />}
          {cardState === 'loading' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
          {cardState === 'result' && isGo && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
          {cardState === 'result' && !isGo && <AlertTriangle className="w-5 h-5 text-destructive" />}

          <div className="flex-1">
            <h3 className="font-semibold text-sm">
              {cardState === 'disabled' && 'GO or PIVOT — Avaliação de VC'}
              {cardState === 'idle' && 'GO or PIVOT — Avaliação de VC'}
              {cardState === 'loading' && 'Analisando sua ideia...'}
              {cardState === 'result' && isGo && 'SEGUIR EM FRENTE'}
              {cardState === 'result' && !isGo && 'PIVOTAR'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {cardState === 'disabled' && 'Complete a Etapa 2 para habilitar'}
              {cardState === 'idle' && 'Um avaliador crítico de VC analisa sua ideia'}
              {cardState === 'loading' && 'Isso pode levar até 30 segundos'}
              {cardState === 'result' && `${result!.confidence}% de confiança`}
            </p>
          </div>

          {cardState === 'result' && (
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                isGo
                  ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                  : 'bg-destructive/20 text-destructive'
              }`}
            >
              {result!.verdict}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Disabled state */}
          {cardState === 'disabled' && (
            <p className="text-sm text-muted-foreground">
              Gere o documento da Etapa 2 primeiro. Após concluída, um avaliador de Venture Capital
              analisará criticamente sua ideia e emitirá um veredicto GO ou PIVOT com razões concretas.
            </p>
          )}

          {/* Idle state */}
          {cardState === 'idle' && (
            <>
              <p className="text-sm text-muted-foreground">
                Um avaliador com mentalidade de VC (honesto e anti-sycophantic) analisa mercado,
                diferencial competitivo, viabilidade técnica, modelo de receita e timing.
              </p>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <Button onClick={evaluate} className="w-full sm:w-auto">
                Avaliar agora
              </Button>
            </>
          )}

          {/* Loading state */}
          {cardState === 'loading' && (
            <div className="flex items-center gap-3 py-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                Analisando Etapas 1 e 2... aguarde até 30 segundos.
              </p>
            </div>
          )}

          {/* Result state */}
          {cardState === 'result' && result && (
            <>
              {/* Confidence bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Confiança</span>
                  <span>{result.confidence}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${isGo ? 'bg-green-500' : 'bg-destructive'}`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              {/* Reasons */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {isGo ? 'Pontos fortes' : 'Problemas críticos'}
                </p>
                <ul className="space-y-1.5">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="mt-0.5 shrink-0 text-muted-foreground">
                        {isGo ? '✓' : '✗'}
                      </span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pivot recommendations */}
              {!isGo && result.pivotRecommendations && result.pivotRecommendations.length > 0 && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Direções de pivot sugeridas
                  </p>
                  <ul className="space-y-1.5">
                    {result.pivotRecommendations.map((r, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="shrink-0 text-muted-foreground">→</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.fromCache && (
                <p className="text-xs text-muted-foreground">
                  Avaliação de {new Date(result.createdAt).toLocaleDateString('pt-BR')}
                  {' · '}
                  <button
                    onClick={() => setCardState('idle')}
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    Reavaliar
                  </button>
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1 flex-wrap">
                {isGo ? (
                  <Button
                    onClick={() => router.push(`/projeto/${projectId}/fase2/etapa3`)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Avançar para Etapa 3 →
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-muted-foreground"
                      onClick={() => setCardState('idle')}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reavaliar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/40 text-destructive hover:bg-destructive/10"
                      onClick={() => setShowOverrideDialog(true)}
                    >
                      Prosseguir assim mesmo
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Override confirmation dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Tem certeza?
            </DialogTitle>
            <DialogDescription>
              O avaliador recomendou um <strong>PIVOT</strong>. Prosseguir pode significar investir
              tempo em uma direção com problemas sérios. Confirme apenas se você tem convicção
              baseada em dados que o avaliador não possui.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOverrideDialog(false)}
              disabled={overriding}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleOverrideConfirm}
              disabled={overriding}
            >
              {overriding ? 'Confirmando...' : 'Confirmar — seguir assim mesmo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
