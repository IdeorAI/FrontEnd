// app/idea/create/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function IdeaCreatePage() {
  const router = useRouter();
  const goToDescribe = () => router.push("/idea/descreva");

  return (
    <div className="w-full mx-auto px-4">
      {/* Título */}
     <div className="mx-auto w-full max-w-[640px] py-4">
      <div className="flex items-center justify-between ">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />Criar novo pro  jeto</h1>
      </div>
      </div>
      {/* CARD PRINCIPAL */}
      <Card className="mx-auto w-full max-w-[640px] rounded-3xl border-white/10 bg-slate-950/80 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-4">
          <CardTitle className="text-lg sm:text-xl font-semibold">
            Inicie sua nova Startup
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {" "}
          {/* Reduzi o space-y de 6 para 4 */}
          {/* Seção do primeiro botão */}
          <div className="space-y-1">
            {" "}
            {/* Espaçamento menor entre frase e botão */}
            <CardDescription className="text-center text-sm text-white/70">
              Você pode melhorar uma ideia
            </CardDescription>
            <Button
              size="lg"
              className="w-full font-semibold rounded-lg shadow-md
          bg-gradient-to-r from-[#07f7eb] to-[#9B6CFF]
          hover:shadow-glow transition-all duration-300 
          transform hover:scale-105 text-purple-950 drop-shadow-lg"
              onClick={goToDescribe}
            >
              JÁ TENHO UMA IDEIA INICIAL
            </Button>
          </div>
          {/* Seção do segundo botão */}
          <div className="space-y-1">
            {" "}
            {/* Espaçamento menor entre frase e botão */}
            <CardDescription className="text-center text-sm text-white/70">
              Ou receber sugestões para iniciar do zero
            </CardDescription>
            <Button
              size="lg"
              className="w-full font-semibold rounded-lg shadow-md
          bg-gradient-hero hover:shadow-glow transition-all duration-300 
          transform hover:scale-105 text-[#1e2830] drop-shadow-lg"
              onClick={goToDescribe}
            >
              COMEÇAR COM A AJUDA DO IDEOR ✨
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
