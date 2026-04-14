"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart2,
  Zap,
  TrendingUp,
  Clock,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

// ---- Types ----

interface DayStats {
  date: string;
  calls: number;
  tokens: number;
}

interface ModelStats {
  model: string;
  calls: number;
  tokens: number;
}

interface RecentCall {
  id: string;
  taskId: string;
  model: string;
  tokensUsed: number;
  createdAt: string;
}

interface TokenStats {
  totalCalls: number;
  totalTokens: number;
  avgTokensPerCall: number;
  byDay: DayStats[];
  byModel: ModelStats[];
  recentCalls: RecentCall[];
}

// ---- Helpers ----

function fmt(n: number) {
  return n.toLocaleString("pt-BR");
}

function relativeDate(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  return d.toLocaleDateString("pt-BR");
}

// ---- Component ----

export default function AdminTokensPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [days, setDays] = useState(30);
  const [refreshing, setRefreshing] = useState(false);

  const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

  async function fetchStats(userId: string, daysBack: number) {
    const from = new Date();
    from.setDate(from.getDate() - daysBack);
    const fromStr = from.toISOString().split("T")[0];

    const res = await fetch(
      `${API}/api/admin/token-stats?from=${fromStr}`,
      { headers: { "x-user-id": userId } }
    );

    if (res.status === 403) {
      setUnauthorized(true);
      return;
    }

    if (!res.ok) throw new Error("Falha ao buscar estatísticas");
    const data: TokenStats = await res.json();
    setStats(data);
  }

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth/login"); return; }

      // Verifica se é admin
      const meRes = await fetch(`${API}/api/admin/me`, {
        headers: { "x-user-id": user.id },
      });
      if (!meRes.ok || !(await meRes.json()).isAdmin) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      try {
        await fetchStats(user.id, days);
      } catch {
        // stats ficam null — exibe erro inline
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await fetchStats(user.id, days);
    setRefreshing(false);
  }

  async function handleDaysChange(d: number) {
    setDays(d);
    setRefreshing(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await fetchStats(user.id, d);
    setRefreshing(false);
  }

  // ---- Render states ----

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-muted-foreground">
        <span className="text-4xl">🔒</span>
        <p className="text-lg font-medium text-foreground">Acesso restrito</p>
        <p className="text-sm">Você não tem permissão para acessar esta página.</p>
        <button
          onClick={() => router.replace("/dashboard")}
          className="mt-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Voltar ao dashboard
        </button>
      </div>
    );
  }

  // Barra de progresso diária — normaliza pelo máximo de tokens do período
  const maxTokensDay = stats ? Math.max(...stats.byDay.map((d) => d.tokens), 1) : 1;

  return (
    <div className="min-h-screen bg-background p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <span className="text-muted-foreground">/</span>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">Observabilidade de Tokens IA</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de período */}
          {([7, 14, 30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => handleDaysChange(d)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                days === d
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-muted"
              }`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 border rounded-md hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={<Zap className="h-5 w-5 text-primary" />}
          label="Total de chamadas"
          value={fmt(stats?.totalCalls ?? 0)}
          sub={`últimos ${days} dias`}
        />
        <SummaryCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          label="Tokens consumidos"
          value={fmt(stats?.totalTokens ?? 0)}
          sub="estimativa de uso"
        />
        <SummaryCard
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          label="Média por chamada"
          value={fmt(stats?.avgTokensPerCall ?? 0)}
          sub="tokens/chamada"
        />
      </div>

      {/* Gráfico por dia */}
      {stats && stats.byDay.length > 0 && (
        <div className="border rounded-lg p-5 space-y-3 bg-card">
          <h2 className="font-semibold text-sm">Tokens por dia</h2>
          <div className="space-y-1.5">
            {stats.byDay.map((d) => (
              <div key={d.date} className="flex items-center gap-2 text-xs">
                <span className="w-24 text-muted-foreground shrink-0">{d.date}</span>
                <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded transition-all duration-500 flex items-center pl-2"
                    style={{ width: `${Math.max((d.tokens / maxTokensDay) * 100, 2)}%` }}
                  >
                    {d.tokens > maxTokensDay * 0.15 && (
                      <span className="text-[10px] text-primary-foreground font-medium">
                        {fmt(d.tokens)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="w-10 text-right text-muted-foreground shrink-0">
                  {d.calls}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Por modelo */}
      {stats && stats.byModel.length > 0 && (
        <div className="border rounded-lg p-5 space-y-3 bg-card">
          <h2 className="font-semibold text-sm">Por modelo</h2>
          <div className="divide-y text-sm">
            {stats.byModel.map((m) => (
              <div key={m.model} className="flex items-center justify-between py-2">
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                  {m.model}
                </span>
                <div className="flex gap-6 text-xs text-muted-foreground">
                  <span>{fmt(m.tokens)} tokens</span>
                  <span>{m.calls} chamadas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chamadas recentes */}
      {stats && stats.recentCalls.length > 0 && (
        <div className="border rounded-lg p-5 space-y-3 bg-card">
          <h2 className="font-semibold text-sm">Chamadas recentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left pb-2 font-medium">Modelo</th>
                  <th className="text-right pb-2 font-medium">Tokens</th>
                  <th className="text-right pb-2 font-medium">Quando</th>
                  <th className="text-right pb-2 font-medium">Task ID</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.recentCalls.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2">
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">
                        {c.model}
                      </span>
                    </td>
                    <td className="py-2 text-right font-medium">{fmt(c.tokensUsed)}</td>
                    <td className="py-2 text-right text-muted-foreground">
                      {relativeDate(c.createdAt)}
                    </td>
                    <td className="py-2 text-right font-mono text-muted-foreground text-[10px]">
                      {c.taskId.slice(0, 8)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats && stats.totalCalls === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nenhuma chamada registrada nos últimos {days} dias.
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="border rounded-lg p-4 bg-card space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
