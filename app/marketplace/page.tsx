"use client";

import { useState, useEffect } from "react";
import {
  Rocket,
  Briefcase,
  Star,
  MessageSquare,
  Plus,
  Loader2,
  Mail,
  User,
  Calendar,
  X,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AnunciarModal } from "@/components/marketplace/anunciar-modal";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import {
  getListings,
  expressInterest,
  type ListingWithOwner,
} from "@/lib/api/marketplace";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tab = "projetos" | "servicos";

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<Tab>("projetos");
  const [anunciarOpen, setAnunciarOpen] = useState(false);
  const [listings, setListings] = useState<ListingWithOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [interestSent, setInterestSent] = useState<Set<string>>(new Set());

  // Modal de detalhes
  const [selectedListing, setSelectedListing] = useState<ListingWithOwner | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

  const handleSendMessage = async () => {
    if (!selectedListing || !currentUserId) return;
    if (!contactMessage.trim()) {
      toast.error("Escreva uma mensagem antes de enviar.");
      return;
    }
    setIsSendingMessage(true);
    try {
      await expressInterest(selectedListing.id, contactMessage.trim());
      setInterestSent((prev) => new Set(prev).add(selectedListing.id));
      toast.success("Mensagem enviada com sucesso!");
      setContactMessage("");
    } catch {
      toast.error("Não foi possível enviar a mensagem.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const projects = listings.filter((l) => l.listing_type === "project");
  const services = listings.filter((l) => l.listing_type === "service");
  const displayItems = activeTab === "projetos" ? projects : services;

  const reloadListings = () => {
    getListings().then(setListings).catch(() => {});
  };

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
              {activeTab === "projetos"
                ? "Nenhum projeto publicado ainda"
                : "Nenhum serviço publicado ainda"}
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
          {displayItems.map((listing) => (
            <button
              key={listing.id}
              onClick={() => setSelectedListing(listing)}
              className="bg-card border rounded-lg p-5 space-y-3 hover:shadow-md transition-shadow text-left w-full"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {listing.listing_type === "project" ? (
                    <Rocket className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Briefcase className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                  <h3 className="font-semibold text-base line-clamp-1">{listing.title}</h3>
                </div>
                {listing.category && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                      listing.listing_type === "project"
                        ? "bg-primary/10 text-primary"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {listing.category}
                  </span>
                )}
              </div>

              {listing.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {listing.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {listing.owner_name && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {listing.owner_name}
                    </span>
                  )}
                  {listing.listing_type === "project" && listing.project_score != null && listing.project_score > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {listing.project_score}
                    </span>
                  )}
                </div>
                {listing.owner_id === currentUserId && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Seu anúncio
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal de detalhes do listing */}
      <Dialog
        open={!!selectedListing}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedListing(null);
            setContactMessage("");
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedListing && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {selectedListing.listing_type === "project" ? (
                    <Rocket className="h-5 w-5 text-primary" />
                  ) : (
                    <Briefcase className="h-5 w-5 text-blue-500" />
                  )}
                  <DialogTitle className="text-lg">{selectedListing.title}</DialogTitle>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Metadata */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {selectedListing.owner_name && (
                    <span className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      {selectedListing.owner_name}
                    </span>
                  )}
                  {selectedListing.category && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        selectedListing.listing_type === "project"
                          ? "bg-primary/10 text-primary"
                          : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {selectedListing.category}
                    </span>
                  )}
                  {selectedListing.listing_type === "project" &&
                    selectedListing.project_score != null &&
                    selectedListing.project_score > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Score: {selectedListing.project_score}
                      </span>
                    )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedListing.published_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                {/* Description */}
                {selectedListing.description && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedListing.description}
                    </p>
                  </div>
                )}

                {/* Contato */}
                {selectedListing.owner_id !== currentUserId && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Entrar em contato
                    </h4>

                    {interestSent.has(selectedListing.id) ? (
                      <p className="text-sm text-green-600">
                        Mensagem enviada! O anunciante receberá sua mensagem.
                      </p>
                    ) : (
                      <>
                        <Textarea
                          placeholder="Escreva uma mensagem para o anunciante..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          rows={3}
                          maxLength={500}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={isSendingMessage || !contactMessage.trim()}
                          className="gap-2 w-full"
                          size="sm"
                        >
                          <Send className="h-4 w-4" />
                          {isSendingMessage ? "Enviando..." : "Enviar mensagem"}
                        </Button>
                      </>
                    )}

                    {selectedListing.contact_email && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">
                          Ou entre em contato diretamente:
                        </p>
                        <a
                          href={`mailto:${selectedListing.contact_email}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1.5"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {selectedListing.contact_email}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {selectedListing.owner_id === currentUserId && (
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-sm text-muted-foreground">
                      Este é o seu anúncio.
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setSelectedListing(null);
                    setContactMessage("");
                  }}
                >
                  <X className="h-4 w-4" />
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AnunciarModal
        open={anunciarOpen}
        onClose={(newListing) => {
          setAnunciarOpen(false);
          if (newListing) {
            // Muda para a aba correta e adiciona imediatamente ao estado
            setActiveTab(newListing.listing_type === "project" ? "projetos" : "servicos");
            setListings((prev) => [
              { ...newListing, owner_name: null, project_score: null },
              ...prev,
            ]);
            // Reload em background para enriquecer com owner_name e project_score
            setTimeout(() => reloadListings(), 800);
          } else {
            reloadListings();
          }
        }}
      />
    </div>
  );
}
