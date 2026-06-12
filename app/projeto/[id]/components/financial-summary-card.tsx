'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FinancialSummary,
  triggerFinancialSummary,
  getFinancialSummary,
} from '@/lib/api/financial-summary';
import {
  DollarSign,
  TrendingUp,
  FileMinus,
  Wallet,
  BarChart3,
  Settings2,
  Coins,
  Lock,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FinancialHighlights } from './financial-highlights';

interface Props {
  projectId: string;
  userId: string;
  /** Etapa 4 concluída (evaluated) libera a geração. */
  etapa4Complete: boolean;
}

type CardState = 'disabled' | 'idle' | 'loading' | 'result';

const fmtBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export function FinancialSummaryCard({ projectId, userId, etapa4Complete }: Props) {
  const router = useRouter();
  const [cardState, setCardState] = useState<CardState>(etapa4Complete ? 'idle' : 'disabled');
  const [result, setResult] = useState<FinancialSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quando a etapa 4 conclui, sai de 'disabled'.
  useEffect(() => {
    if (etapa4Complete && cardState === 'disabled') setCardState(result ? 'result' : 'idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapa4Complete]);

  // Busca o resumo já gerado. Re-busca no mount E quando a aba volta ao foco
  // (ex.: usuário editou a DRE em /financeiro e voltou) — mantém a síntese fresca.
  useEffect(() => {
    if (!etapa4Complete) return;
    let cancelled = false;

    const refetch = async () => {
      try {
        const cached = await getFinancialSummary(projectId, userId);
        if (cancelled) return;
        if (cached) {
          setResult(cached);
          setCardState((s) => (s === 'loading' ? s : 'result'));
        }
      } catch (err) {
        console.warn('Falha ao carregar Resumo Financeiro:', err);
      }
    };

    refetch();

    const onFocus = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [etapa4Complete, projectId, userId]);

  async function generate() {
    setCardState('loading');
    setError(null);
    try {
      const data = await triggerFinancialSummary(projectId, userId);
      setResult(data);
      setCardState('result');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar. Tente novamente.');
      setCardState(result ? 'result' : 'idle');
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Cabeçalho */}
      <div
        className={cn(
          'px-5 py-4 flex items-center gap-2.5',
          cardState === 'disabled' ? 'bg-muted/60' : 'bg-muted/40',
        )}
      >
        {cardState === 'disabled' ? (
          <Lock className="h-4 w-4 text-ink-muted shrink-0" strokeWidth={2} />
        ) : (
          <DollarSign className="h-4 w-4 text-primary shrink-0" strokeWidth={2} />
        )}
        <div className="flex-1">
          <h3 className="text-[13px] font-bold text-ink-primary">Resumo Financeiro</h3>
          <p className="text-xs text-muted-foreground">Projeção para o primeiro ano</p>
        </div>
      </div>

      {cardState === 'disabled' && (
        <div className="px-5 py-5 space-y-4">
          {/* Highlights rotativos (fade in/out) do que a análise entrega */}
          <FinancialHighlights />

          <p className="text-sm text-muted-foreground">
            Gere uma análise projetada para 12 meses com receitas, custos e lucro — editável a qualquer momento.
          </p>

          {/* Botão apagado até a etapa estar concluída */}
          <div className="space-y-1.5">
            <Button disabled className="gap-2 w-full opacity-50 cursor-not-allowed">
              <DollarSign className="h-4 w-4" /> Gerar resumo financeiro
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Conclua a Etapa 05 - Modelo de Negócio antes de gerar
            </p>
          </div>
        </div>
      )}

      {cardState === 'idle' && (
        <div className="px-5 py-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            Gere uma análise projetada para 12 meses com receitas, custos e lucro — editável a qualquer momento.
          </p>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}
          <Button onClick={generate} className="gap-2">
            <DollarSign className="h-4 w-4" /> Gerar resumo financeiro
          </Button>
        </div>
      )}

      {cardState === 'loading' && (
        <div className="px-5 py-5 flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Montando sua projeção financeira…
        </div>
      )}

      {cardState === 'result' && result && (
        <div className="px-3 py-3 space-y-1">
          <SinteseRow icon={TrendingUp} label="Receita Bruta (anual)" value={fmtBRL.format(result.receitaBrutaAnual)} />
          <SinteseRow icon={FileMinus} label="Deduções e Impostos (anual)" value={fmtBRL.format(result.deducoesAnual)} />
          <SinteseRow icon={Wallet} label="Receita Líquida (anual)" value={fmtBRL.format(result.receitaLiquidaAnual)} />
          <SinteseRow icon={BarChart3} label="Lucro Bruto (anual)" value={fmtBRL.format(result.lucroBrutoAnual)} />
          <SinteseRow icon={Settings2} label="Despesas Operacionais (média mensal)" value={fmtBRL.format(result.opexMensalMedia)} />
          <SinteseRow
            icon={Coins}
            label="Lucro Líquido (anual)"
            value={fmtBRL.format(result.lucroLiquidoAnual)}
            valueClassName={result.lucroLiquidoAnual >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}
          />

          <button
            type="button"
            onClick={() => router.push(`/projeto/${projectId}/financeiro`)}
            className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Ver análise financeira detalhada
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </Card>
  );
}

function SinteseRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/40 transition-colors">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} aria-hidden="true" />
      <span className="flex-1 text-[13px] text-ink-secondary">{label}</span>
      <span className={cn('text-[13px] font-semibold tabular-nums', valueClassName ?? 'text-ink-primary')}>
        {value}
      </span>
    </div>
  );
}
