// components/dre-table.tsx
// DRE (Demonstração de Resultado) editável — Etapa 4 (Modelo de Negócio).
// - Totais (=) são fórmulas recalculadas 100% no client (nunca confia na IA).
// - Edição via painel externo: linha + mês inicial/final + valor + "Atualizar".
// - Adicionar/remover linha (receita ou despesa). Persiste via callback onSave.
"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const MESES = 12;
const fmtBRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

// ---------- Tipos ----------
export type DreLinha = {
  id: string;
  descricao: string;
  tipo: "entrada" | "calculado";
  grupo: string; // receita | deducao | cpv | opex | depreciacao | financeiro | imposto | total
  valores: number[]; // 12 posições
  removivel?: boolean; // true para linhas adicionadas pelo usuário
};

export type DreData = {
  meses: number;
  linhas: DreLinha[];
};

// ---------- Esqueleto default (tolera JSON ausente/parcial) ----------
const zeros = () => Array(MESES).fill(0);

function defaultLinhas(): DreLinha[] {
  return [
    { id: "receita_bruta", descricao: "(=) RECEITA BRUTA", tipo: "entrada", grupo: "receita", valores: zeros() },
    { id: "deducoes", descricao: "(-) Deduções e Impostos sobre Vendas", tipo: "entrada", grupo: "deducao", valores: zeros() },
    { id: "receita_liquida", descricao: "(=) RECEITA LÍQUIDA", tipo: "calculado", grupo: "total", valores: zeros() },
    { id: "cpv", descricao: "(-) CPV (Custo de Produto Vendido)", tipo: "entrada", grupo: "cpv", valores: zeros() },
    { id: "lucro_bruto", descricao: "(=) LUCRO BRUTO", tipo: "calculado", grupo: "total", valores: zeros() },
    { id: "opex", descricao: "(-) Despesas Operacionais (OPEX)", tipo: "entrada", grupo: "opex", valores: zeros() },
    { id: "ebitda", descricao: "(=) EBITDA / LAJIDA", tipo: "calculado", grupo: "total", valores: zeros() },
    { id: "depreciacao", descricao: "(-) Depreciação e Amortização", tipo: "entrada", grupo: "depreciacao", valores: zeros() },
    { id: "ebit", descricao: "(=) EBIT / LAJ", tipo: "calculado", grupo: "total", valores: zeros() },
    { id: "resultado_financeiro", descricao: "(+/-) Resultado Financeiro", tipo: "entrada", grupo: "financeiro", valores: zeros() },
    { id: "lair", descricao: "(=) LAIR", tipo: "calculado", grupo: "total", valores: zeros() },
    { id: "irpj_csll", descricao: "(-) IRPJ e CSLL", tipo: "entrada", grupo: "imposto", valores: zeros() },
    { id: "lucro_liquido", descricao: "(=) LUCRO LÍQUIDO", tipo: "calculado", grupo: "total", valores: zeros() },
  ];
}

// Normaliza a entrada (vinda da IA / banco) para 13 linhas default + extras do usuário,
// garantindo 12 valores numéricos por linha.
function normalize(raw: Partial<DreData> | null | undefined): DreData {
  const base = defaultLinhas();
  const byId = new Map<string, DreLinha>(base.map((l) => [l.id, l]));
  const extras: DreLinha[] = [];

  for (const l of raw?.linhas ?? []) {
    const valores = sanitizeValores(l?.valores);
    if (byId.has(l.id)) {
      // Sobrescreve só os valores das linhas default (estrutura é fixa)
      const target = byId.get(l.id)!;
      if (target.tipo === "entrada") target.valores = valores;
    } else if (l?.id && l?.descricao) {
      // Linha adicionada pelo usuário
      extras.push({
        id: String(l.id),
        descricao: String(l.descricao),
        tipo: "entrada",
        grupo: l.grupo === "receita" ? "receita" : "opex",
        valores,
        removivel: true,
      });
    }
  }

  // Reconstrói a ordem inserindo extras no grupo certo
  const linhas: DreLinha[] = [];
  for (const l of base) {
    linhas.push(byId.get(l.id)!);
    if (l.id === "receita_bruta") {
      extras.filter((e) => e.grupo === "receita").forEach((e) => linhas.push(e));
    }
    if (l.id === "opex") {
      extras.filter((e) => e.grupo === "opex").forEach((e) => linhas.push(e));
    }
  }

  return recalcular({ meses: MESES, linhas });
}

function sanitizeValores(v: unknown): number[] {
  const arr = Array.isArray(v) ? v : [];
  const out = zeros();
  for (let i = 0; i < MESES; i++) {
    const n = Number(arr[i]);
    out[i] = Number.isFinite(n) ? n : 0;
  }
  return out;
}

// ---------- Recálculo (fórmulas) — função pura ----------
function recalcular(data: DreData): DreData {
  const linhas = data.linhas.map((l) => ({ ...l, valores: [...l.valores] }));
  const get = (id: string) => linhas.find((l) => l.id === id);
  const sum = (grupo: string, excludeIds: string[] = []) => {
    const acc = zeros();
    for (const l of linhas) {
      if (l.grupo === grupo && l.tipo === "entrada" && !excludeIds.includes(l.id)) {
        for (let m = 0; m < MESES; m++) acc[m] += l.valores[m];
      }
    }
    return acc;
  };

  const receitaBrutaTotal = sum("receita"); // receita_bruta + receitas adicionadas
  const deducoes = get("deducoes")?.valores ?? zeros();
  const cpv = get("cpv")?.valores ?? zeros();
  const opexTotal = sum("opex"); // opex + despesas adicionadas
  const depreciacao = get("depreciacao")?.valores ?? zeros();
  const financeiro = get("resultado_financeiro")?.valores ?? zeros();
  const imposto = get("irpj_csll")?.valores ?? zeros();

  const receitaLiquida = zeros();
  const lucroBruto = zeros();
  const ebitda = zeros();
  const ebit = zeros();
  const lair = zeros();
  const lucroLiquido = zeros();

  for (let m = 0; m < MESES; m++) {
    receitaLiquida[m] = receitaBrutaTotal[m] - deducoes[m];
    lucroBruto[m] = receitaLiquida[m] - cpv[m];
    ebitda[m] = lucroBruto[m] - opexTotal[m];
    ebit[m] = ebitda[m] - depreciacao[m];
    lair[m] = ebit[m] + financeiro[m];
    lucroLiquido[m] = lair[m] - imposto[m];
  }

  const setCalc = (id: string, vals: number[]) => {
    const l = get(id);
    if (l) l.valores = vals;
  };
  setCalc("receita_liquida", receitaLiquida);
  setCalc("lucro_bruto", lucroBruto);
  setCalc("ebitda", ebitda);
  setCalc("ebit", ebit);
  setCalc("lair", lair);
  setCalc("lucro_liquido", lucroLiquido);

  return { ...data, linhas };
}

// ---------- Séries para o gráfico ----------
export type DreSeriePonto = {
  mes: string;        // "Mês 1" ... "Mês 12"
  receita: number;    // Receita Bruta do mês
  despesas: number;   // Soma de TODAS as saídas do mês
  lucro: number;      // Lucro Líquido do mês
};

/**
 * Calcula as 3 séries mensais para o gráfico a partir da DRE recalculada.
 * - receita  = soma do grupo "receita" (inclui receitas adicionadas)
 * - despesas = TODAS as saídas do mês = Receita Bruta − Lucro Líquido
 *   (equivale a deduções + CPV + OPEX + depreciação + impostos − resultado financeiro,
 *    e captura automaticamente quaisquer linhas extras de despesa/receita)
 * - lucro    = linha lucro_liquido
 */
export function computeSeriesMensais(input: Partial<DreData> | null | undefined): DreSeriePonto[] {
  const data = recalcular(normalize(input));
  const receitaGrupo = zeros();
  for (const l of data.linhas) {
    if (l.grupo === "receita" && l.tipo === "entrada") {
      for (let m = 0; m < MESES; m++) receitaGrupo[m] += l.valores[m];
    }
  }
  const lucro = data.linhas.find((l) => l.id === "lucro_liquido")?.valores ?? zeros();

  return Array.from({ length: MESES }, (_, m) => ({
    mes: `Mês ${m + 1}`,
    receita: receitaGrupo[m],
    despesas: receitaGrupo[m] - lucro[m],
    lucro: lucro[m],
  }));
}

// ---------- Componente ----------
type DreTableProps = {
  dre: Partial<DreData> | null | undefined;
  /** Persiste a DRE atualizada (objeto). Se ausente, modo somente-leitura. */
  onSave?: (dre: DreData) => Promise<void>;
  /** Notifica a DRE recalculada a cada mudança (para gráficos etc.). */
  onDataChange?: (data: DreData) => void;
};

export function DreTable({ dre, onSave, onDataChange }: DreTableProps) {
  const [data, setData] = useState<DreData>(() => normalize(dre));
  const [saving, setSaving] = useState(false);

  // Notifica o consumidor (ex.: gráfico) sempre que a DRE recalculada muda.
  useEffect(() => {
    onDataChange?.(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Painel de atualização
  const [linhaSel, setLinhaSel] = useState<string>("");
  const [mesIni, setMesIni] = useState<string>("1");
  const [mesFim, setMesFim] = useState<string>("12");
  const [valor, setValor] = useState<string>("");

  // Adicionar linha
  const [novaDesc, setNovaDesc] = useState<string>("");
  const [novoGrupo, setNovoGrupo] = useState<string>("opex");

  const linhasEntrada = useMemo(
    () => data.linhas.filter((l) => l.tipo === "entrada"),
    [data.linhas]
  );

  const persist = useCallback(
    async (next: DreData) => {
      setData(next);
      if (!onSave) return;
      setSaving(true);
      try {
        await onSave(next);
      } catch {
        toast.error("Falha ao salvar a DRE");
      } finally {
        setSaving(false);
      }
    },
    [onSave]
  );

  const handleAtualizar = useCallback(() => {
    if (!linhaSel) return toast.error("Selecione uma linha");
    const v = Number(valor.replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(v)) return toast.error("Digite um valor numérico válido");
    const ini = parseInt(mesIni, 10);
    const fim = parseInt(mesFim, 10);
    if (fim < ini) return toast.error("O mês final deve ser ≥ ao mês inicial");

    const next = recalcular({
      ...data,
      linhas: data.linhas.map((l) => {
        if (l.id !== linhaSel) return l;
        const valores = [...l.valores];
        for (let m = ini - 1; m <= fim - 1; m++) valores[m] = v;
        return { ...l, valores };
      }),
    });
    void persist(next);
    setValor("");
    toast.success("DRE atualizada");
  }, [linhaSel, valor, mesIni, mesFim, data, persist]);

  const handleAdicionar = useCallback(() => {
    const desc = novaDesc.trim();
    if (!desc) return toast.error("Descreva a nova linha");
    const id = `${novoGrupo}_${Date.now().toString(36)}`;
    const nova: DreLinha = {
      id,
      descricao: (novoGrupo === "receita" ? "(+) " : "(-) ") + desc,
      tipo: "entrada",
      grupo: novoGrupo,
      valores: zeros(),
      removivel: true,
    };
    // Insere no grupo certo (após a última linha do grupo)
    const linhas = [...data.linhas];
    const ancora = novoGrupo === "receita" ? "receita_bruta" : "opex";
    let idx = linhas.findIndex((l) => l.id === ancora);
    // pula extras já existentes do mesmo grupo
    while (idx + 1 < linhas.length && linhas[idx + 1].grupo === novoGrupo) idx++;
    linhas.splice(idx + 1, 0, nova);

    void persist(recalcular({ ...data, linhas }));
    setNovaDesc("");
    toast.success("Linha adicionada");
  }, [novaDesc, novoGrupo, data, persist]);

  const handleRemover = useCallback(
    (id: string) => {
      void persist(recalcular({ ...data, linhas: data.linhas.filter((l) => l.id !== id) }));
      toast.success("Linha removida");
    },
    [data, persist]
  );

  const readOnly = !onSave;

  return (
    <div className="space-y-4">
      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="sticky left-0 z-20 bg-muted text-left font-semibold p-2 min-w-[220px] border-r border-border shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]">
                Descrição da Conta
              </th>
              {Array.from({ length: MESES }, (_, i) => (
                <th key={i} className="text-right font-medium p-2 whitespace-nowrap text-muted-foreground">
                  Mês {i + 1}
                </th>
              ))}
              <th className="text-right font-bold p-2 whitespace-nowrap bg-muted border-l border-border text-foreground">
                Total
              </th>
              {!readOnly && <th className="w-10 sticky right-0 z-20 bg-muted border-l border-border" />}
            </tr>
          </thead>
          <tbody>
            {data.linhas.map((l) => {
              const isTotal = l.tipo === "calculado";
              return (
                <tr
                  key={l.id}
                  className={isTotal ? "bg-muted/60 font-semibold border-t border-border" : "border-t border-border/50"}
                >
                  <td className={`sticky left-0 z-10 p-2 whitespace-nowrap border-r border-border shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)] ${isTotal ? "bg-muted" : "bg-card"}`}>
                    {l.descricao}
                  </td>
                  {l.valores.map((v, m) => (
                    <td key={m} className={`text-right p-2 whitespace-nowrap tabular-nums ${v < 0 ? "text-red-500" : ""}`}>
                      {fmtBRL.format(v)}
                    </td>
                  ))}
                  {(() => {
                    const total = l.valores.reduce((a, b) => a + b, 0);
                    return (
                      <td
                        className={`text-right p-2 whitespace-nowrap tabular-nums font-semibold border-l border-border ${
                          isTotal ? "bg-muted" : "bg-card"
                        } ${total < 0 ? "text-red-500" : ""}`}
                      >
                        {fmtBRL.format(total)}
                      </td>
                    );
                  })()}
                  {!readOnly && (
                    <td className={`p-1 text-center sticky right-0 z-10 border-l border-border ${isTotal ? "bg-muted" : "bg-card"}`}>
                      {l.removivel && (
                        <button
                          type="button"
                          onClick={() => handleRemover(l.id)}
                          aria-label={`Remover linha ${l.descricao}`}
                          title="Remover esta linha"
                          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {readOnly ? null : (
        <>
          {/* Painel de atualização */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <p className="text-sm font-medium">Atualizar valores</p>
            <div className="flex flex-col sm:flex-row sm:items-end gap-2">
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs text-muted-foreground mb-1 block">Linha</label>
                <Select value={linhaSel} onValueChange={setLinhaSel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a linha..." />
                  </SelectTrigger>
                  <SelectContent>
                    {linhasEntrada.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <label className="text-xs text-muted-foreground mb-1 block">Mês inicial</label>
                <Select value={mesIni} onValueChange={setMesIni}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: MESES }, (_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <label className="text-xs text-muted-foreground mb-1 block">Mês final</label>
                <Select value={mesFim} onValueChange={setMesFim}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: MESES }, (_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <label className="text-xs text-muted-foreground mb-1 block">Valor (R$)</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              </div>
              <Button type="button" onClick={handleAtualizar} disabled={saving}>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Adicionar linha */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <p className="text-sm font-medium">Adicionar linha</p>
            <div className="flex flex-col sm:flex-row sm:items-end gap-2">
              <div className="w-40">
                <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                <Select value={novoGrupo} onValueChange={setNovoGrupo}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opex">Despesa (OPEX)</SelectItem>
                    <SelectItem value="receita">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
                <Input
                  type="text"
                  placeholder="Ex.: Ferramentas de software"
                  value={novaDesc}
                  onChange={(e) => setNovaDesc(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" onClick={handleAdicionar} disabled={saving}>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Adicionar
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            As linhas de total (=) são calculadas automaticamente. Valores em Reais (R$).
          </p>
        </>
      )}
    </div>
  );
}
