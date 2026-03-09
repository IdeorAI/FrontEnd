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

interface AnunciarModalProps {
  open: boolean;
  onClose: () => void;
}

type AnunciarType = "projeto" | "servico" | null;

export function AnunciarModal({ open, onClose }: AnunciarModalProps) {
  const [type, setType] = useState<AnunciarType>(null);

  function handleClose() {
    setType(null);
    onClose();
  }

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
              <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Em breve
              </span>
            </div>

            <Input placeholder="Nome do projeto / serviço" disabled />
            <Textarea placeholder="Descrição..." rows={3} disabled />
            <Input placeholder={type === "projeto" ? "Preço ou 'Negociável'" : "Valor/hora ou 'Sob consulta'"} disabled />

            <p className="text-xs text-muted-foreground text-center">
              Esta funcionalidade estará disponível em breve. Cadastre seu interesse e avisamos você!
            </p>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancelar</Button>
              <Button className="flex-1" disabled>Publicar anúncio</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
