"use client";

import { Search, X, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type SortOrder = "recent" | "oldest" | "score_desc";

interface MarketplaceFiltersProps {
  onAnunciar: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  onClearFilters: () => void;
  availableCategories: string[];
  resultCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
}

export function MarketplaceFilters({
  onAnunciar,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortOrder,
  onSortChange,
  onClearFilters,
  availableCategories,
  resultCount,
  totalCount,
  hasActiveFilters,
}: MarketplaceFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Busca */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar no marketplace..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => onSearchChange("")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Categoria */}
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {availableCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Ordenação */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as SortOrder)}
          >
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
            <option value="score_desc">Maior score</option>
          </select>
        </div>

        <Button onClick={onAnunciar} variant="default" size="sm" className="sm:ml-auto flex-shrink-0">
          + Anunciar
        </Button>
      </div>

      {/* Contador + limpar filtros */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {hasActiveFilters
            ? `${resultCount} de ${totalCount} resultado${totalCount !== 1 ? "s" : ""}`
            : `${totalCount} anúncio${totalCount !== 1 ? "s" : ""}`}
        </span>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <X className="h-3 w-3" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
