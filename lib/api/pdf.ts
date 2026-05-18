import { authHeaders } from "./auth-headers";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export async function downloadStagePdf(
  projectId: string,
  taskId: string,
  filename: string
): Promise<void> {
  const headers = await authHeaders();

  const res = await fetch(
    `${API_BASE}/api/projects/${projectId}/tasks/${taskId}/pdf`,
    { method: "POST", headers }
  );

  if (res.status === 401) throw new Error("Não autorizado");
  if (res.status === 403) throw new Error("Sem permissão para este projeto");
  if (res.status === 404) throw new Error("Etapa não encontrada");
  if (!res.ok) throw new Error(`Erro ${res.status} ao gerar PDF`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
