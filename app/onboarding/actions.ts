// app/onboarding/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface OnboardingAnswers {
  has_idea: "sim_especifica" | "algumas_ideias" | "descobrindo";
  objetivo: "saber_valor" | "primeiros_clientes" | "pitch";
  socios: "solo" | "com_socios";
}

export async function completeOnboarding(answers: OnboardingAnswers) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      onboarding_answers: answers,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Erro ao salvar onboarding:", error);
    throw new Error("Falha ao salvar configurações");
  }

  redirect("/dashboard");
}
