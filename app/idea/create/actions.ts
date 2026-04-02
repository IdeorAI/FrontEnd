"use server";

import { createClient } from "@/lib/supabase/server";

export async function createDraftProject() {
  const supabase = await createClient();

  // Pegar usuário autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Usuário não autenticado" };
  }

  console.log("Server: Criando projeto para user:", {
    id: user.id,
    email: user.email,
  });

  // Verificar se profile existe
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Server: Erro ao verificar profile:", profileError);
  }

  // Se profile não existe, criar
  if (!profile) {
    console.log("Server: Profile não existe, criando...");
    const { error: createProfileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email || "",
      })
      .select()
      .maybeSingle();

    if (createProfileError) {
      console.error("Server: Erro ao criar profile:", createProfileError);
      return {
        error: `Erro ao criar profile: ${createProfileError.message}`,
      };
    }
    console.log("Server: Profile criado com sucesso");
  }

  // Gerar nome único baseado no timestamp
  const now = new Date();
  const timestamp = now.getTime(); // Unix timestamp em milissegundos
  const projectName = `Novo projeto ${timestamp}`;

  console.log("Server: Tentando criar projeto com nome:", projectName);

  // Criar projeto
  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      name: projectName,
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
    console.error("Server: Erro ao criar projeto:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { error: error.message || "Erro ao criar projeto" };
  }

  console.log("Server: Projeto criado com sucesso:", data.id);
  return { projectId: data.id };
}
