'use client';

// Highlights rotativos do card Resumo Financeiro (estado bloqueado).
// Mostra um item por vez com fade in/out, em loop, para "vender" o que a
// análise financeira vai entregar antes mesmo de estar liberada.

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  FileMinus,
  Wallet,
  BarChart3,
  Settings2,
  Coins,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { icon: TrendingUp, label: 'Receita Bruta' },
  { icon: FileMinus, label: 'Deduções e Impostos' },
  { icon: Wallet, label: 'Receita Líquida' },
  { icon: BarChart3, label: 'Lucro Bruto' },
  { icon: Settings2, label: 'Despesas Operacionais' },
  { icon: Coins, label: 'Lucro Líquido' },
] as const;

const VISIBLE_MS = 3000; // tempo com o item visível
const FADE_MS = 700; // duração do fade

export function FinancialHighlights() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // ciclo: visível (VISIBLE_MS) → fade out (FADE_MS) → troca item → fade in
    const fadeTimer = setTimeout(() => setVisible(false), VISIBLE_MS);
    const swapTimer = setTimeout(() => {
      setIndex((i) => (i + 1) % ITEMS.length);
      setVisible(true);
    }, VISIBLE_MS + FADE_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(swapTimer);
    };
  }, [index]);

  const { icon: Icon, label } = ITEMS[index];

  return (
    <div
      className="flex items-center justify-center gap-2 h-8"
      aria-live="polite"
      aria-label="Itens da análise financeira"
    >
      <div
        className={cn(
          'flex items-center gap-2 transition-opacity ease-in-out',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      >
        <Icon className="h-4 w-4 text-primary shrink-0" strokeWidth={2} aria-hidden="true" />
        <span className="text-sm font-semibold text-ink-primary">{label}</span>
      </div>
    </div>
  );
}
