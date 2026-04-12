"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Rocket, Briefcase } from "lucide-react";
import { createListing } from "@/lib/api/marketplace";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface AnunciarModalProps {
  open: boolean;
  onClose: () => void;
}

type AnunciarType = "projeto" | "servico" | null;

const CATEGORIES = ["Fintech", "Healthtech", "Edtech", "Agritech", "SaaS", "E-commerce", "Outro"];

export function AnunciarModal({ open, onClose }: AnunciarModalProps) {
  const [type, setType] = useState<AnunciarType>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClose() {
    setType(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setContactEmail("");
    onClose();
  }

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Informe um título para o anúncio.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Faça login para publicar.");
        return;
      }

      await createListing({
        owner_id: user.id,
        project_id: null,
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        listing_type: type === "projeto" ? "project" : "service",
        contact_email: contactEmail.trim() || user.email || null,
      });

      toast.success("Anúncio publicado com sucesso!");
      handleClose();
    } catch {
      toast.error("Erro ao publicar anúncio. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>O que você quer anunciar?</DialogTitle>
          <DialogDescription>
            Escolha o tipo de anúncio para continuar
          </DialogDescription>
        </DialogHeader>

        {!type && (
          <div className="grid grid-cols-2 gap-4 py-2">
            <button
              onClick={() => setType("projeto")}
              className="flex flex-col items-center gap-3 p-5 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Projeto / Startup</p>
                <p className="text-xs text-muted-foreground mt-0.5">Venda ou busque sócios</p>
              </div>
            </button>

            <button
              onClick={() => setType("servico")}
              className="flex flex-col items-center gap-3 p-5 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-secondary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">Serviço / Freelance</p>
                <p className="text-xs text-muted-foreground mt-0.5">Ofereça sua expertise</p>
              </div>
            </button>
          </div>
        )}

        {type && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <button onClick={() => setType(null)} className="text-xs text-muted-foreground hover:text-foreground">
                ← Voltar
              </button>
              <span className="text-sm font-medium">
                {type === "projeto" ? "Anunciar Projeto / Startup" : "Anunciar Serviço"}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Título *</label>
              <Input
                placeholder={type === "projeto" ? "Nome do projeto ou startup" : "Nome do seu serviço"}
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Descrição</label>
              <Textarea
                placeholder="Descreva seu projeto ou serviço..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">E-mail de contato</label>
              <Input
                placeholder="seu@email.com"
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancelar</Button>
              <Button
                className="flex-1"
                onClick={handlePublish}
                disabled={isSubmitting || !title.trim()}
              >
                {isSubmitting ? "Publicando..." : "Publicar anúncio"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
