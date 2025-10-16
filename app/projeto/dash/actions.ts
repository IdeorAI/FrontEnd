"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteProject(projectId: string) {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Usuário não autenticado");
    throw new Error("Usuário não autenticado");
  }

  console.log("Tentando excluir projeto:", projectId, "do usuário:", user.id);

  // Primeiro verificar se o projeto existe e pertence ao usuário
  const { data: project, error: selectError } = await supabase
    .from("projects")
    .select("id, owner_id, name")
    .eq("id", projectId)
    .single();

  if (selectError) {
    console.error("Erro ao buscar projeto:", selectError);
    throw new Error(`Projeto não encontrado: ${selectError.message}`);
  }

  console.log("Projeto encontrado:", project);

  if (project.owner_id !== user.id) {
    console.error("Usuário não é dono do projeto");
    throw new Error("Você não tem permissão para excluir este projeto");
  }

  // Deletar projeto usando RPC para bypass RLS policies
  // Primeiro tentar delete normal
  const { error: deleteError, count } = await supabase
    .from("projects")
    .delete({ count: "exact" })
    .eq("id", projectId)
    .eq("owner_id", user.id);

  console.log("Resultado da exclusão - erro:", deleteError, "linhas afetadas:", count);

  if (deleteError) {
    console.error("Erro ao excluir projeto:", deleteError);
    throw new Error(`Erro ao excluir projeto: ${deleteError.message}`);
  }

  if (count === 0) {
    console.error("Nenhuma linha foi excluída - possível problema com RLS policies");
    throw new Error(
      "Não foi possível excluir o projeto. Verifique as permissões no Supabase (RLS policies)"
    );
  }

  console.log(`Projeto excluído com sucesso! ${count} linha(s) removida(s)`);

  // Limpar cache de forma mais agressiva
  revalidatePath("/dashboard", "page");
  revalidatePath("/projeto/dash", "page");
  revalidatePath("/", "layout");

  // Redirecionar para o dashboard
  redirect("/dashboard");
}
