import { createClient } from '@/lib/supabase/client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  projectId?: string;
  currentStageIndex?: number;
  ivoScore?: number;
  score?: number;
  goPivotVerdict?: string;
  projectName?: string;
  mode?: 'guide' | 'refine';
  stageContent?: string;
  stageName?: string;
}

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const headers: Record<string, string> = {};
  if (user) {
    headers['x-user-id'] = user.id;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

export async function* streamChat(
  message: string,
  history: ChatMessage[],
  ctx: ChatContext,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const headers = await authHeaders();

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: history.slice(-6),
      mode: ctx.mode ?? 'guide',
      projectId: ctx.projectId,
      currentStageIndex: ctx.currentStageIndex ?? 0,
      ivoScore: ctx.ivoScore,
      score: ctx.score,
      goPivotVerdict: ctx.goPivotVerdict,
      projectName: ctx.projectName,
      stageContent: ctx.stageContent,
      stageName: ctx.stageName,
    }),
    signal,
  });

  if (res.status === 429) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Limite de mensagens atingido.');
  }
  if (!res.ok) throw new Error(`Chat error: ${res.status}`);

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      try {
        const parsed = JSON.parse(data);
        if (parsed.done) return;
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.delta) yield parsed.delta;
      } catch {
        // skip malformed chunk
      }
    }
  }
}
