// app/marketplace/page.tsx
import { MarketplaceTabs } from "@/components/marketplace/marketplace-tabs";
import { mockProjects, mockServices } from "./_data/mock";

export default function MarketplacePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Compre, venda e colabore — projetos, startups e especialistas em um só lugar
        </p>
      </div>

      {/* Tabs + conteúdo interativo (Client Component) */}
      <MarketplaceTabs projects={mockProjects} services={mockServices} />
    </div>
  );
}
