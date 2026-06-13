// lib/api/subitem-assist.ts
// Spec 024 — ajuda da IA por subitem no modo manual (gerar / revisar).
import { authHeaders } from "./auth-headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_API_URL é obrigatória em produção");
}

async function postSubitem(
  projectId: string,
  path: "subitem-assist" | "subitem-review",
  body: Record<string, string>,
  userId: string
): Promise<string> {
  const res = await fetch(
    `${API_BASE}/api/projects/${projectId}/manual-stages/${path}`,
    {
      method: "POST",
      headers: await authHeaders(userId, { "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Falha na ajuda da IA (${res.status}).`);
  }
  const data = await res.json();
  return (data.text ?? data.Text ?? "") as string;
}

/** Gera (sugere) o texto de um subitem a partir do contexto do projeto. */
export function assistSubitem(
  projectId: string,
  phase: string,
  subitemKey: string,
  subitemLabel: string,
  userId: string
): Promise<string> {
  return postSubitem(
    projectId,
    "subitem-assist",
    { phase, subitemKey, subitemLabel },
    userId
  );
}

/** Revisa/melhora o texto que o usuário escreveu para um subitem. */
export function reviewSubitem(
  projectId: string,
  phase: string,
  subitemKey: string,
  subitemLabel: string,
  currentText: string,
  userId: string
): Promise<string> {
  return postSubitem(
    projectId,
    "subitem-review",
    { phase, subitemKey, subitemLabel, currentText },
    userId
  );
}
