import { authHeaders } from "./auth-headers";
import { createClient } from "@/lib/supabase/client";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export type DocType = "pitch-deck" | "business-plan" | "executive-summary";

export async function generateFinalDocument(
  projectId: string,
  docType: DocType
): Promise<string> {
  const headers = await authHeaders();
  const res = await fetch(
    `${API_BASE}/api/projects/${projectId}/documents/${docType}/generate`,
    { method: "POST", headers }
  );
  if (res.status === 400) {
    const body = await res.json().catch(() => ({ error: "Requisição inválida" }));
    throw new Error(body.error ?? "Requisição inválida");
  }
  if (!res.ok) throw new Error(`Erro ${res.status} ao gerar documento`);
  const json = await res.json();
  return (json.content_md ?? json.contentMd) as string;
}

export async function downloadFinalDocumentPdf(
  projectId: string,
  docType: DocType,
  filename: string
): Promise<void> {
  const headers = await authHeaders();

  const res = await fetch(
    `${API_BASE}/api/projects/${projectId}/documents/${docType}/pdf`,
    { method: "GET", headers }
  );
  if (res.status === 404)
    throw new Error("Documento ainda não gerado. Clique em Gerar primeiro.");
  if (!res.ok) throw new Error(`Erro ${res.status} ao baixar PDF`);

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

export interface GeneratedDocSummary {
  doc_type: DocType;
  generated_at: string;
}

export async function listGeneratedDocuments(
  projectId: string
): Promise<GeneratedDocSummary[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("generated_documents")
    .select("doc_type, generated_at")
    .eq("project_id", projectId);
  return (data as GeneratedDocSummary[] | null) ?? [];
}
