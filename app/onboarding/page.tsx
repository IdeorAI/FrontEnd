import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WelcomeForm } from "./welcome-form";

export const metadata = {
  title: "Bem-vindo ao IdeorAI",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Se já completou o onboarding, vai direto para o dashboard
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Profile fetch error:", profileError.message);
  }

  if (profile?.onboarding_completed) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Bem-vindo ao IdeorAI</h1>
          <p className="text-muted-foreground text-sm">
            Antes de começar, conta pra gente um pouco sobre você.
          </p>
        </div>
        <WelcomeForm />
      </div>
    </div>
  );
}
