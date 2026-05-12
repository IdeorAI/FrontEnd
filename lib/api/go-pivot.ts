import { createClient } from '@/lib/supabase/client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function authHeaders(userId: string): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'x-user-id': userId };
  if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
  return headers;
}

export interface GoPivotResponse {
  evaluationId: string;
  verdict: 'GO' | 'PIVOT';
  confidence: number;
  reasons: string[];
  pivotRecommendations?: string[];
  override: boolean;
  fromCache: boolean;
  createdAt: string;
}

export async function getGoPivot(projectId: string, userId: string): Promise<GoPivotResponse | null> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/go-or-pivot`, {
    headers: await authHeaders(userId),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GO/PIVOT fetch failed: ${res.status}`);
  return res.json();
}

export async function triggerGoPivot(projectId: string, userId: string): Promise<GoPivotResponse> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/go-or-pivot`, {
    method: 'POST',
    headers: await authHeaders(userId),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Avaliação falhou: ${res.status}`);
  }
  return res.json();
}

export async function confirmOverride(projectId: string, userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/go-or-pivot/override`, {
    method: 'POST',
    headers: { ...(await authHeaders(userId)), 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm: true }),
  });
  if (!res.ok) throw new Error(`Override falhou: ${res.status}`);
}
