// app/idea/_utils.ts
import { createClient } from "@/lib/supabase/client";

export async function ensureDraftProject(
  userId: string,
  userEmail: string,
  projectId?: string
) {
  const supabase = createClient();

  // se já veio projectId, apenas retorna
  if (projectId) return { id: projectId };

  console.log("Criando projeto para userId:", userId);

  // Primeiro, tentar garantir que o perfil existe
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("Erro ao verificar profile:", profileError);
  }

  if (!profile) {
    console.log("Profile não encontrado, tentando criar...");
    const { error: insertProfileError } = await supabase
      .from("profiles")
      .insert({ id: userId, email: userEmail })
      .select()
      .maybeSingle();

    if (insertProfileError) {
      console.error("Erro ao criar profile:", insertProfileError);
      // Continua mesmo se não conseguir criar o profile
    } else {
      console.log("Profile criado com sucesso");
    }
  }

  // cria rascunho mínimo com valores padrão seguros baseado no schema da tabela
  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: userId,
      name: "Novo projeto",
      description: null,
      score: 0.0,
      valuation: 250.0,
      progress_breakdown: {},
      current_phase: "fase1",
      category: null,
      generated_options: null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Erro detalhado do Supabase:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      userId,
      fullError: JSON.stringify(error),
    });
    throw error;
  }

  if (!data || !data.id) {
    throw new Error("Projeto criado mas sem ID retornado");
  }

  console.log("Projeto criado com sucesso:", data.id);
  return { id: data.id as string };
}
