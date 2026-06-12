import { authHeaders } from './auth-headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Spec 023: após editar manualmente a Etapa N, marca as etapas posteriores
 * concluídas como "Desatualizadas" (badge âmbar). Só sinaliza — não regenera.
 * Falha aqui NÃO deve bloquear o save da edição (chamar com try/catch no caller).
 */
export async function markLaterStagesOutdated(
  projectId: string,
  stageIndex: number,
): Promise<number> {
  const res = await fetch(
    `${API_BASE}/api/projects/${projectId}/tasks/mark-outdated/${stageIndex}`,
    { method: 'POST', headers: await authHeaders() },
  );
  if (!res.ok) throw new Error(`mark-outdated falhou: ${res.status}`);
  const body = (await res.json().catch(() => ({ marked: 0 }))) as { marked?: number };
  return body.marked ?? 0;
}
