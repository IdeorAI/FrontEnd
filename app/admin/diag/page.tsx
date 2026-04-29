"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function AdminDiagPage() {
  const router = useRouter();
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

  async function run() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const uid = user?.id ?? null;
    setUserId(uid);

    try {
      const res = await fetch(
        `${API}/api/admin/diag${uid ? `?userId=${uid}` : ""}`,
        { headers: uid ? { "x-user-id": uid } : {} }
      );
      const json = await res.json();
      setResult({ status: res.status, body: json });
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { run(); }, []);

  return (
    <div className="min-h-screen bg-background p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-lg font-bold">Token Observability — Diagnóstico</h1>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="p-1.5 border rounded-md hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="text-xs text-muted-foreground border rounded p-3 bg-muted/40">
        <strong>User ID (Supabase):</strong> {userId ?? "não autenticado"}
      </div>

      <div className="border rounded-lg p-4 bg-card">
        <h2 className="text-sm font-semibold mb-3">Resposta de <code>/api/admin/diag</code></h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <pre className="text-xs overflow-auto whitespace-pre-wrap break-all bg-muted p-3 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>

      <div className="border rounded-lg p-4 bg-card space-y-2 text-xs text-muted-foreground">
        <p><strong>O que verificar no resultado:</strong></p>
        <ul className="list-disc pl-4 space-y-1">
          <li><code>isAdmin: true</code> → admin check OK</li>
          <li><code>totalEvaluationsReturned &gt; 0</code> → tabela tem dados</li>
          <li><code>profileInfo.is_admin: true</code> → coluna existe no banco</li>
          <li><code>evalError</code> vazio → tabela <code>ia_evaluations</code> existe</li>
          <li><code>adminCheckError</code> vazio → query de admin funcionou</li>
        </ul>
      </div>
    </div>
  );
}
