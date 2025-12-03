"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

interface LeadCaptureDialogProps {
  children: React.ReactNode;
  triggerClassName?: string;
}

export function LeadCaptureDialog({ children, triggerClassName }: LeadCaptureDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validação básica
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Por favor, preencha todos os campos");
      setIsSubmitting(false);
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Por favor, insira um e-mail válido");
      setIsSubmitting(false);
      return;
    }

    try {
      // Enviar lead para API do backend (integrado com HubSpot)
      const response = await fetch("https://backend-4kbu.onrender.com/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("Lead enviado para HubSpot com sucesso:", result);
        setIsSuccess(true);

        // Resetar formulário e fechar modal após 2 segundos
        setTimeout(() => {
          setFormData({ name: "", email: "", phone: "" });
          setIsSuccess(false);
          setIsOpen(false);
        }, 2000);
      } else {
        console.error("Erro ao enviar lead:", result.message);
        alert(result.message || "Erro ao enviar. Tente novamente.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Erro ao enviar lead:", error);
      alert("Erro ao conectar com o servidor. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className={triggerClassName}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Comece sua jornada!
              </DialogTitle>
              <DialogDescription className="text-base">
                Preencha com seus dados e seja um dos primeiros a criar sua startup com ajuda da IdeorAI
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={handleChange("name")}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joao@example.com"
                  value={formData.email}
                  onChange={handleChange("email")}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                <PhoneInput
                  defaultCountry="br"
                  value={formData.phone}
                  onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
                  disabled={isSubmitting}
                  inputClassName="w-full"
                  countrySelectorStyleProps={{
                    buttonClassName: "border-input",
                  }}
                  inputProps={{
                    required: true,
                    id: "phone",
                  }}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-hero text-[#1e2830] font-semibold hover:shadow-glow"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Quero criar minha startup"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Seus dados estão seguros conosco. Não compartilhamos com terceiros.
              </p>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <DialogTitle className="text-2xl">Sucesso!</DialogTitle>
            <DialogDescription className="text-base">
              Obrigado por se cadastrar! Em breve você receberá nossas dicas exclusivas.
            </DialogDescription>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
