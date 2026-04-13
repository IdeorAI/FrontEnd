// components/dashboard-filters.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X, ArrowUpDown } from "lucide-react";
import categories from "@/lib/data/categories.json";

type SortKey =
  | "updated_desc"
  | "created_desc"
  | "score_desc"
  | "valuation_desc"
  | "name_asc";

const sortLabels: Record<SortKey, string> = {
  updated_desc: "Atualizados recentemente",
  created_desc: "Mais recentes",
  score_desc: "Maior score",
  valuation_desc: "Maior valuation",
  name_asc: "Nome (A–Z)",
};

export function DashboardFilters() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [cat, setCat] = useState(sp.get("cat") ?? "");
  const [sort, setSort] = useState<SortKey>(
    (sp.get("sort") as SortKey) ?? "updated_desc"
  );

  // Debounce para busca — evita requisição a cada tecla
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParams = (overrides: { q?: string; cat?: string; sort?: SortKey }) => {
    const params = new URLSearchParams();
    const next = { q, cat, sort, ...overrides };
    if (next.q.trim()) params.set("q", next.q.trim());
    if (next.cat) params.set("cat", next.cat);
    if (next.sort !== "updated_desc") params.set("sort", next.sort);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ q: value }), 400);
  };

  const handleCat = (value: string) => {
    setCat(value);
    pushParams({ cat: value });
  };

  const handleSort = (value: SortKey) => {
    setSort(value);
    pushParams({ sort: value });
  };

  const clearAll = () => {
    setQ("");
    setCat("");
    setSort("updated_desc");
    router.replace(pathname);
  };

  const hasFilters = !!q || !!cat || sort !== "updated_desc";

  // Sincroniza com back/forward do browser
  useEffect(() => {
    setQ(sp.get("q") ?? "");
    setCat(sp.get("cat") ?? "");
    setSort(((sp.get("sort") as SortKey) ?? "updated_desc") as SortKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Busca */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                pushParams({ q });
              }
            }}
            placeholder="Buscar projeto..."
            className="pl-9 pr-8"
          />
          {q && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => handleSearch("")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Categoria */}
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          value={cat}
          onChange={(e) => handleCat(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Ordenação */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={sort}
            onChange={(e) => handleSort(e.target.value as SortKey)}
          >
            {(Object.keys(sortLabels) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {sortLabels[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Limpar filtros */}
      {hasFilters && (
        <div className="flex items-center justify-end">
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <X className="h-3 w-3" />
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
