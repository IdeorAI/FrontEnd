// lib/supabase-tasks.ts
// Funções para salvar tasks/documentos gerados diretamente no Supabase

import { createClient } from './supabase/client';

// Mapeamento de etapas para títulos
const STAGE_TITLES: Record<string, string> = {
  etapa1: 'Problema e Oportunidade',
  etapa2: 'Pesquisa de Mercado',
  etapa3: 'Proposta de Valor',
  etapa4: 'Modelo de Negócio',
  etapa5: 'MVP (Minimum Viable Product)',
  etapa6: 'Equipe Mínima',
  etapa7: 'Pitch Deck + Plano Executivo + Resumo'
};

export interface SaveTaskRequest {
  projectId: string;
  userId: string;
  stage: string;
  content: string;
}

export interface SaveTaskResponse {
  taskId: string;
  success: boolean;
}

/**
 * Salva um documento gerado no Supabase (tabela tasks)
 */
export async function saveGeneratedDocument(
  request: SaveTaskRequest
): Promise<SaveTaskResponse> {
  const supabase = createClient();

  console.log('[supabase-tasks] Salvando documento:', {
    projectId: request.projectId,
    stage: request.stage,
    contentLength: request.content.length
  });

  try {
    // Verificar se já existe uma task para este projeto/etapa
    const { data: existingTasks, error: searchError } = await supabase
      .from('tasks')
      .select('id')
      .eq('project_id', request.projectId)
      .eq('phase', request.stage)
      .maybeSingle();

    if (searchError && searchError.code !== 'PGRST116') { // PGRST116 = not found (ok)
      console.error('[supabase-tasks] Erro ao buscar task existente:', searchError);
      throw new Error(`Erro ao verificar task existente: ${searchError.message}`);
    }

    let taskId: string;

    if (existingTasks) {
      // Task já existe, fazer UPDATE
      console.log('[supabase-tasks] Task existente encontrada, atualizando:', existingTasks.id);

      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update({
          content: request.content,
          status: 'evaluated',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingTasks.id)
        .select('id')
        .single();

      if (updateError) {
        console.error('[supabase-tasks] Erro ao atualizar task:', updateError);
        throw new Error(`Erro ao atualizar task: ${updateError.message}`);
      }

      taskId = updatedTask.id;
      console.log('[supabase-tasks] ✅ Task atualizada com sucesso:', taskId);
    } else {
      // Task não existe, fazer INSERT
      console.log('[supabase-tasks] Criando nova task...');

      const title = STAGE_TITLES[request.stage] || request.stage;
      const description = `Documento gerado automaticamente para a ${title}`;

      const { data: newTask, error: insertError } = await supabase
        .from('tasks')
        .insert({
          project_id: request.projectId,
          title,
          description,
          phase: request.stage,
          content: request.content,
          status: 'evaluated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('[supabase-tasks] Erro ao criar task:', insertError);
        throw new Error(`Erro ao criar task: ${insertError.message}`);
      }

      taskId = newTask.id;
      console.log('[supabase-tasks] ✅ Nova task criada com sucesso:', taskId);
    }

    return {
      taskId,
      success: true
    };
  } catch (error) {
    console.error('[supabase-tasks] Erro geral:', error);
    throw error;
  }
}

/**
 * Busca um documento existente por projeto e etapa
 */
export async function getExistingDocument(
  projectId: string,
  stage: string
): Promise<{ id: string; content: string } | null> {
  const supabase = createClient();

  console.log('[supabase-tasks] Buscando documento existente:', { projectId, stage });

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, content')
      .eq('project_id', projectId)
      .eq('phase', stage)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('[supabase-tasks] Erro ao buscar documento:', error);
      throw new Error(`Erro ao buscar documento: ${error.message}`);
    }

    if (data) {
      console.log('[supabase-tasks] ✅ Documento encontrado:', data.id);
      return data;
    }

    console.log('[supabase-tasks] Documento não encontrado');
    return null;
  } catch (error) {
    console.error('[supabase-tasks] Erro geral ao buscar:', error);
    throw error;
  }
}

/**
 * Deleta um documento (task) por ID
 */
export async function deleteDocument(taskId: string): Promise<boolean> {
  const supabase = createClient();

  console.log('[supabase-tasks] Deletando documento:', taskId);

  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('[supabase-tasks] Erro ao deletar:', error);
      throw new Error(`Erro ao deletar documento: ${error.message}`);
    }

    console.log('[supabase-tasks] ✅ Documento deletado com sucesso');
    return true;
  } catch (error) {
    console.error('[supabase-tasks] Erro geral ao deletar:', error);
    throw error;
  }
}

/**
 * Lista todos os documentos de um projeto
 */
export async function listDocumentsByProject(projectId: string) {
  const supabase = createClient();

  console.log('[supabase-tasks] Listando documentos do projeto:', projectId);

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('phase', { ascending: true });

    if (error) {
      console.error('[supabase-tasks] Erro ao listar:', error);
      throw new Error(`Erro ao listar documentos: ${error.message}`);
    }

    console.log('[supabase-tasks] ✅ Documentos encontrados:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[supabase-tasks] Erro geral ao listar:', error);
    throw error;
  }
}
