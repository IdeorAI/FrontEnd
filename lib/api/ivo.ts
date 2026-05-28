// API client para recálculo manual do IVO Index.
// Usado como garantia (belt-and-suspenders) após a geração de etapa —
// não substitui o recálculo automático do backend, apenas garante
// que o IVO foi atualizado mesmo se algo no orquestrador falhar.
import { log } from "@/lib/logger";
import { authHeaders } from "./auth-headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface IvoDataResponse {
  scoreIvo: number;
  o: number;
  m: number;
  v: number;
  e: number;
  t: number;
  d: number;
  ivoValue: number;
  ivoIndex: number;
  isPartial: boolean;
}

/**
 * Força recálculo do IVO Index no backend.
 * Idempotente, seguro de chamar múltiplas vezes.
 * Requer JWT válido (mesma auth dos outros endpoints).
 */
export async function recalculateIvo(projectId: string): Promise<IvoDataResponse | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/projects/${projectId}/recalculate-ivo`,
      {
        method: "POST",
        headers: await authHeaders(),
      }
    );

    if (!res.ok) {
      log.warn("[recalculateIvo] não-OK", {
        status: res.status,
        projectId,
      });
      return null;
    }

    return await res.json();
  } catch (error) {
    log.warn("[recalculateIvo] falha de rede (não-crítico)", {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
