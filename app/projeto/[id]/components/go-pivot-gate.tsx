'use client';

import { useState } from 'react';
import { GoPivotResponse, triggerGoPivot, confirmOverride } from '@/lib/api/go-pivot';

interface Props {
  projectId: string;
  userId: string;
  cached: GoPivotResponse | null;
  onGo: () => void;
  onCancel: () => void;
}

type State = 'idle' | 'loading' | 'result' | 'override-confirm';

export function GoPivotGate({ projectId, userId, cached, onGo, onCancel }: Props) {
  const [state, setState] = useState<State>(cached ? 'result' : 'idle');
  const [result, setResult] = useState<GoPivotResponse | null>(cached);
  const [error, setError] = useState<string | null>(null);
  const [overriding, setOverriding] = useState(false);

  async function evaluate() {
    setState('loading');
    setError(null);
    try {
      const data = await triggerGoPivot(projectId, userId);
      setResult(data);
      setState('result');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido');
      setState('idle');
    }
  }

  async function handleOverride() {
    setOverriding(true);
    try {
      await confirmOverride(projectId, userId);
      onGo();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao confirmar override');
      setOverriding(false);
      setState('result');
    }
  }

  if (state === 'idle') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card border rounded-2xl max-w-md w-full p-8 flex flex-col gap-6 shadow-2xl">
          <div className="text-center">
            <div className="text-4xl mb-3">⚖️</div>
            <h2 className="text-xl font-bold">Gate: GO or PIVOT</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Antes de avançar para a Etapa 3, um avaliador de VC irá analisar
              criticamente sua ideia com base nas etapas 1 e 2.
            </p>
          </div>
          {error && (
            <p className="text-destructive text-sm text-center bg-destructive/10 rounded-lg p-3">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={evaluate}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Avaliar agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card border rounded-2xl max-w-md w-full p-8 flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Analisando sua ideia...</p>
        </div>
      </div>
    );
  }

  if (state === 'override-confirm') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-destructive/40 rounded-2xl max-w-md w-full p-8 flex flex-col gap-6 shadow-2xl">
          <div className="text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold text-destructive">Tem certeza?</h2>
            <p className="text-muted-foreground text-sm mt-2">
              O avaliador recomendou um PIVOT. Continuar mesmo assim pode significar
              investir tempo em uma direção fraca. Confirme apenas se você tem
              convicção baseada em dados que o avaliador não possui.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setState('result')}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors"
              disabled={overriding}
            >
              Voltar
            </button>
            <button
              onClick={handleOverride}
              disabled={overriding}
              className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {overriding ? 'Confirmando...' : 'Confirmar e continuar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // state === 'result'
  if (!result) return null;

  const isGo = result.verdict === 'GO';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-card border rounded-2xl max-w-lg w-full p-8 flex flex-col gap-5 shadow-2xl ${
          isGo ? 'border-green-500/40' : 'border-destructive/40'
        }`}
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-2">{isGo ? '🚀' : '🔄'}</div>
          <div
            className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-2 ${
              isGo
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {result.verdict}
          </div>
          <div className="text-xs text-muted-foreground">
            Confiança: {result.confidence}%
          </div>
        </div>

        {/* Confidence bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${isGo ? 'bg-green-500' : 'bg-destructive'}`}
            style={{ width: `${result.confidence}%` }}
          />
        </div>

        {/* Reasons */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Avaliação
          </p>
          <ul className="flex flex-col gap-1.5">
            {result.reasons.map((r, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="mt-0.5 shrink-0">{isGo ? '✓' : '✗'}</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pivot recommendations */}
        {!isGo && result.pivotRecommendations && result.pivotRecommendations.length > 0 && (
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Recomendações de pivot
            </p>
            <ul className="flex flex-col gap-1.5">
              {result.pivotRecommendations.map((r, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="shrink-0">→</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {result.fromCache && (
          <p className="text-xs text-muted-foreground text-center">
            Avaliação em cache de {new Date(result.createdAt).toLocaleDateString('pt-BR')}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          {isGo ? (
            <>
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors"
              >
                Ficar aqui
              </button>
              <button
                onClick={onGo}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Avançar para Etapa 3 →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Revisar e melhorar
              </button>
              <button
                onClick={() => setState('override-confirm')}
                className="flex-1 py-2.5 rounded-xl border border-destructive/50 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
              >
                Ignorar e continuar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
