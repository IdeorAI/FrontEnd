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
      <div className="mb-6 flex items-center justify-center gap-2">
        <Lightbulb className="h-5 w-5 translate-y-[1px]" />
        <h1 className="text-xl sm:text-2xl font-bold">Criar novo projeto</h1>
      </div>

      {/* CARD PRINCIPAL */}
      <Card className="mx-auto w-full max-w-[640px] rounded-3xl border-white/10 bg-[1e2830] shadow-2xl">
        <CardHeader className="text-center space-y-2 pb-4">
          <CardTitle className="text-lg sm:text-xl font-semibold">
            Inicie sua nova Startup
          </CardTitle>
          <CardDescription className="text-sm text-white/70">
            Você pode melhorar uma ideia
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Botão 1 */}
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

          <div className="text-center">
            <p className="text-sm text-white/70">
              Ou receber sugestões para iniciar do zero
            </p>
          </div>

          {/* Botão 2 */}
          <Button
            size="lg"
            className="w-full font-semibold rounded-lg shadow-md
              bg-gradient-hero hover:shadow-glow transition-all duration-300 
              transform hover:scale-105 text-[#1e2830] drop-shadow-lg"
            onClick={goToDescribe}
          >
            COMEÇAR COM A AJUDA DO IDEOR ✨
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}