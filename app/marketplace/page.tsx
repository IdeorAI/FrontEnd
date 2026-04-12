"use client";

import { useState, useEffect } from "react";
import { Rocket, Briefcase, Star, MessageSquare, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnunciarModal } from "@/components/marketplace/anunciar-modal";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { getListings, expressInterest, type MarketplaceListing } from "@/lib/api/marketplace";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Tab = "projetos" | "servicos";

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<Tab>("projetos");
  const [anunciarOpen, setAnunciarOpen] = useState(false);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [interestSent, setInterestSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      try {
        const data = await getListings();
        setListings(data);
      } catch (err) {
        console.error("Erro ao carregar marketplace:", err);
        toast.error("Não foi possível carregar os anúncios.");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleInterest = async (listingId: string) => {
    if (!currentUserId) {
      toast.error("Faça login para demonstrar interesse.");
      return;
    }
    if (interestSent.has(listingId)) return;
    try {
      await expressInterest(listingId, "");
      setInterestSent(prev => new Set(prev).add(listingId));
      toast.success("Interesse registrado! O anunciante será notificado.");
    } catch {
      toast.error("Não foi possível registrar interesse. Tente novamente.");
    }
  };

  const projects = listings.filter(l => l.listing_type === "project");
  const services = listings.filter(l => l.listing_type === "service");

  const displayItems = activeTab === "projetos" ? projects : services;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Compre, venda e colabore — projetos, startups e especialistas em um só lugar
        </p>
      </div>

      {/* Tabs */}
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
          {projects.length > 0 && (
            <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
              {projects.length}
            </span>
          )}
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
          {services.length > 0 && (
            <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
              {services.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters + anunciar */}
      <MarketplaceFilters onAnunciar={() => setAnunciarOpen(true)} />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : displayItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {activeTab === "projetos" ? (
              <Rocket className="h-8 w-8 text-primary" />
            ) : (
              <Briefcase className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <p className="font-semibold text-lg">
              {activeTab === "projetos" ? "Nenhum projeto publicado ainda" : "Nenhum serviço publicado ainda"}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {activeTab === "projetos"
                ? "Seja o primeiro a publicar seu projeto no marketplace!"
                : "Seja o primeiro a oferecer seus serviços!"}
            </p>
          </div>
          <Button onClick={() => setAnunciarOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Publicar anúncio
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayItems.map(listing => (
            <div key={listing.id} className="bg-card border rounded-lg p-5 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base line-clamp-1">{listing.title}</h3>
                {listing.category && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                    {listing.category}
                  </span>
                )}
              </div>

              {listing.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">{listing.description}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  <span>{new Date(listing.published_at).toLocaleDateString("pt-BR")}</span>
                </div>
                {listing.owner_id !== currentUserId && (
                  <Button
                    size="sm"
                    variant={interestSent.has(listing.id) ? "secondary" : "outline"}
                    onClick={() => handleInterest(listing.id)}
                    className="gap-1.5 text-xs h-7"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {interestSent.has(listing.id) ? "Interesse enviado" : "Tenho interesse"}
                  </Button>
                )}
                {listing.owner_id === currentUserId && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Seu anúncio
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnunciarModal
        open={anunciarOpen}
        onClose={() => {
          setAnunciarOpen(false);
          // Recarregar listings após publicar
          getListings().then(setListings).catch(() => {});
        }}
      />
    </div>
  );
}
