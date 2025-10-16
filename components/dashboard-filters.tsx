// components/dashboard-filters.tsx
"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandInput,
} from "@/components/ui/command";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import categories from "@/lib/data/categories.json";

type SortKey =
  | "created_asc"
  | "created_desc"
  | "updated_desc"
  | "score_desc"
  | "valuation_desc"
  | "name_asc";

const sortLabels: Record<SortKey, string> = {
  created_asc: "Mais antigo → Mais recente",
  created_desc: "Mais recente → Mais antigo",
  updated_desc: "Atualizados recentemente",
  score_desc: "Score (maior → menor)",
  valuation_desc: "Valuation (maior → menor)",
  name_asc: "Nome (A–Z)",
};

const scoreOptions = [
  { value: "3", label: "Acima de 3.0" },
  { value: "5", label: "Acima de 5.0" },
  { value: "7", label: "Acima de 7.0" },
  { value: "9", label: "Acima de 9.0" },
] as const;

const valuationOptions = [
  { value: "lte_1k", label: "Até R$ 1K" },
  { value: "gt_1k", label: "Acima de R$ 1K" },
  { value: "gt_5k", label: "Acima de R$ 5K" },
  { value: "gt_10k", label: "Acima de R$ 10K" },
  { value: "gt_25k", label: "Acima de R$ 25K" },
  { value: "gt_50k", label: "Acima de R$ 50K" },
  { value: "gt_100k", label: "Acima de R$ 100K" },
  { value: "gt_500k", label: "Acima de R$ 500K" },
  { value: "gt_1m", label: "Acima de R$ 1M" },
] as const;

const statusOptions = [
  { value: "dev", label: "Em desenvolvimento" },
  { value: "done", label: "Concluído" },
] as const;

export function DashboardFilters() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [cat, setCat] = useState(sp.get("cat") ?? "");
  const [score, setScore] = useState(sp.get("score") ?? "");
  const [valuation, setValuation] = useState(sp.get("val") ?? "");
  const [status, setStatus] = useState(sp.get("status") ?? "");
  const [sort, setSort] = useState<SortKey>(
    (sp.get("sort") as SortKey) ?? "updated_desc"
  );

  // aplica na URL (sem recarregar)
  const apply = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat) params.set("cat", cat);
    if (score) params.set("score", score);
    if (valuation) params.set("val", valuation);
    if (status) params.set("status", status);
    if (sort) params.set("sort", sort);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    setQ("");
    setCat("");
    setScore("");
    setValuation("");
    setStatus("");
    setSort("updated_desc");
    router.replace(pathname);
  };

  // sincroniza com back/forward do browser
  useEffect(() => {
    setQ(sp.get("q") ?? "");
    setCat(sp.get("cat") ?? "");
    setScore(sp.get("score") ?? "");
    setValuation(sp.get("val") ?? "");
    setStatus(sp.get("status") ?? "");
    setSort(((sp.get("sort") as SortKey) ?? "updated_desc") as SortKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Busca */}
      <div className="flex items-center gap-2 w-full md:max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Encontrar um projeto"
            className="pl-9"
          />
        </div>
        <Button onClick={apply}>Buscar</Button>
        {sp.toString() && (
          <Button variant="ghost" onClick={clearAll} title="Limpar filtros">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filtros & Ordenação */}
      <div className="flex items-center gap-2">
        {/* FILTRAR */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
              <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(96vw,720px)] p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Categoria */}
              <div>
                <div className="text-xs mb-1 opacity-70">Categoria</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" className="w-full justify-between">
                      {cat
                        ? categories.find((c) => c.value === cat)?.label
                        : "Todas"}
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[280px]">
                    <Command>
                      <CommandInput placeholder="Buscar categoria..." />
                      <CommandList>
                        <CommandEmpty>Nada encontrado</CommandEmpty>
                        <CommandGroup>
                          <CommandItem onSelect={() => setCat("")}>Todas</CommandItem>
                          {categories.map((c) => (
                            <CommandItem
                              key={c.value}
                              onSelect={() => setCat(c.value)}
                            >
                              {c.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Score */}
              <div>
                <div className="text-xs mb-1 opacity-70">Score</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" className="w-full justify-between">
                      {score
                        ? scoreOptions.find((s) => s.value === score)?.label
                        : "Todos"}
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[240px]">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          <CommandItem onSelect={() => setScore("")}>Todos</CommandItem>
                          {scoreOptions.map((o) => (
                            <CommandItem
                              key={o.value}
                              onSelect={() => setScore(o.value)}
                            >
                              {o.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Valuation */}
              <div>
                <div className="text-xs mb-1 opacity-70">Valuation</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" className="w-full justify-between">
                      {valuation
                        ? valuationOptions.find((v) => v.value === valuation)?.label
                        : "Todos"}
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[260px]">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          <CommandItem onSelect={() => setValuation("")}>
                            Todos
                          </CommandItem>
                          {valuationOptions.map((v) => (
                            <CommandItem
                              key={v.value}
                              onSelect={() => setValuation(v.value)}
                            >
                              {v.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status */}
              <div>
                <div className="text-xs mb-1 opacity-70">Status</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" className="w-full justify-between">
                      {status
                        ? statusOptions.find((s) => s.value === status)?.label
                        : "Todos"}
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[240px]">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          <CommandItem onSelect={() => setStatus("")}>
                            Todos
                          </CommandItem>
                          {statusOptions.map((s) => (
                            <CommandItem
                              key={s.value}
                              onSelect={() => setStatus(s.value)}
                            >
                              {s.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={clearAll}>
                Limpar
              </Button>
              <Button onClick={apply}>Aplicar</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* ORDENAR POR */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              Ordenar por
              <ChevronDown className="h-4 w-4 ml-2 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0">
            <Command>
              <CommandInput placeholder="Buscar ordenação..." />
              <CommandList>
                <CommandGroup>
                  {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                    <CommandItem key={k} onSelect={() => setSort(k)}>
                      {sortLabels[k]}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
