const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
    headers: { 'x-user-id': userId },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GO/PIVOT fetch failed: ${res.status}`);
  return res.json();
}

export async function triggerGoPivot(projectId: string, userId: string): Promise<GoPivotResponse> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/go-or-pivot`, {
    method: 'POST',
    headers: { 'x-user-id': userId },
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
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify({ confirm: true }),
  });
  if (!res.ok) throw new Error(`Override falhou: ${res.status}`);
}
