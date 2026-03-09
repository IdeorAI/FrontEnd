"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MarketplaceFiltersProps {
  onAnunciar: () => void;
}

export function MarketplaceFilters({ onAnunciar }: MarketplaceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar no marketplace..."
          className="pl-9"
        />
      </div>

      <select
        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        defaultValue="Todos"
      >
        {["Todos", "Fintech", "Healthtech", "Edtech", "Agritech", "SaaS", "E-commerce"].map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <Button onClick={onAnunciar} variant="default" size="sm" className="sm:ml-auto">
        + Anunciar
      </Button>
    </div>
  );
}
