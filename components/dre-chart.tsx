"use client";

// Gráfico financeiro (Spec 022) — 3 linhas mensais: Receita Bruta, Despesas e
// Lucro Líquido. Recebe as séries já calculadas a partir da DRE e re-renderiza
// sempre que elas mudam (a DreTable recalcula a cada edição).

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DreSeriePonto } from "@/components/dre-table";

const fmtBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

// Eixo Y compacto (ex.: 12,5k / 1,2M)
function fmtAxis(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}M`;
  if (abs >= 1_000) return `${(v / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;
  return String(v);
}

const COLORS = {
  receita: "#8c7dff", // roxo primário
  despesas: "#f59e0b", // âmbar
  lucro: "#10b981", // emerald
};

export function DreChart({ data }: { data: DreSeriePonto[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: "currentColor", fillOpacity: 0.6 }}
            tickFormatter={(v: string) => v.replace("Mês ", "M")}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "currentColor", fillOpacity: 0.6 }}
            tickFormatter={fmtAxis}
            width={48}
          />
          <Tooltip
            formatter={(value: number, name: string) => [fmtBRL.format(value), name]}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="receita"
            name="Receita Bruta"
            stroke={COLORS.receita}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="despesas"
            name="Despesas"
            stroke={COLORS.despesas}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="lucro"
            name="Lucro Líquido"
            stroke={COLORS.lucro}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
