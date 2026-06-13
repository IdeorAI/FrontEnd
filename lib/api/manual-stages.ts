// lib/api/manual-stages.ts
// Spec 024 — client do save de etapa no modo manual (Colaborativo).
import { authHeaders } from "./auth-headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_API_URL é obrigatória em produção");
}

export interface SaveManualStageResponse {
  taskId: string;
  phase: string;
  status: string;
}

/**
 * Salva uma etapa manual.
 * - `draft=true`: rascunho parcial (status 'draft', sem IVO/Score nem summary).
 * - `draft=false` (concluir): exige todos os subitens; salva 'evaluated' + summary.
 */
export async function saveManualStage(
  projectId: string,
  phase: string,
  subitems: Record<string, string>,
  userId: string,
  draft = false
): Promise<SaveManualStageResponse> {
  const res = await fetch(
    `${API_BASE}/api/projects/${projectId}/manual-stages/save`,
    {
      method: "POST",
      headers: await authHeaders(userId, { "Content-Type": "application/json" }),
      body: JSON.stringify({ phase, subitems, draft }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Falha ao salvar a etapa (${res.status}).`);
  }
  return res.json();
}
