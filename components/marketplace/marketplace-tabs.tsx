// components/marketplace/marketplace-tabs.tsx
"use client";

import { useState } from "react";
import { ProjectListingCard } from "./project-listing-card";
import { ServiceListingCard } from "./service-listing-card";
import { MarketplaceFilters } from "./marketplace-filters";
import { AnunciarModal } from "./anunciar-modal";
import type { ProjectListing, ServiceListing } from "@/app/marketplace/_types";
import { Rocket, Briefcase } from "lucide-react";

interface MarketplaceTabsProps {
  projects: ProjectListing[];
  services: ServiceListing[];
}

type Tab = "projetos" | "servicos";

export function MarketplaceTabs({ projects, services }: MarketplaceTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("projetos");
  const [anunciarOpen, setAnunciarOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("projetos")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "projetos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Rocket className="h-4 w-4" />
          Projetos & Startups
        </button>
        <button
          onClick={() => setActiveTab("servicos")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "servicos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Serviços & Freelancers
        </button>
      </div>

      {/* Filters */}
      <MarketplaceFilters onAnunciar={() => setAnunciarOpen(true)} />

      {/* Grid */}
      {activeTab === "projetos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectListingCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {activeTab === "servicos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <ServiceListingCard key={s.id} service={s} />
          ))}
        </div>
      )}

      {/* Anunciar modal */}
      <AnunciarModal
        open={anunciarOpen}
        onClose={() => setAnunciarOpen(false)}
      />
    </div>
  );
}
