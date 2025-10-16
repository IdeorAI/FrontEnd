// app/onboarding/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";        
import { createClient } from "@/lib/supabase/server"; 
import Header from "@/components/Header";
import Hero from "@/components/hero"; 
import ValueProposition from "@/components/ValueProposition";
import HowItWorks from "@/components/HowItWorks";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ideor.AI Crie sua startup com IA",
  description:
    "Do zero ao investimento: acompanhe os passos para criar sua startup com a ajuda da IA.",
};

export default async function Page() {
  // Verifica se já existe usuário logado
  const supabase = await createClient();

  // Tentar obter usuário, mas não falhar se não houver token válido
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      user = data.user;
    }
  } catch (error) {
    // Ignorar erros de auth - visitante não autenticado
    console.log("No authenticated user (expected for first-time visitors)");
  }

  // Se já estiver autenticado, manda pro dashboard
  if (user) redirect("/dashboard");
  return (
    <>
      <Header />

      <main className="min-h-screen bg-background text-foreground">
        <Hero />
        <ValueProposition />
        <HowItWorks />
        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
