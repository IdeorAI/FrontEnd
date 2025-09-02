// app/onboarding/page.tsx
import type { Metadata } from "next";

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

export default function Page() {
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
