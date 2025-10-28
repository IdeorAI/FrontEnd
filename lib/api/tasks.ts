// API client para tasks/etapas
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  phase: string;
  content?: string;
  status: 'draft' | 'submitted' | 'evaluated';
  evaluationResult?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  evaluationsCount: number;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  phase: string;
  content?: string;
}

export async function getProjectTasks(projectId: string, userId: string): Promise<ProjectTask[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/tasks`, {
    headers: {
      'x-user-id': userId,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function getTask(taskId: string, userId: string): Promise<ProjectTask> {
  const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
    headers: {
      'x-user-id': userId,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch task');
  return res.json();
}

export async function getNextStage(
  projectId: string,
  userId: string
): Promise<{ nextStage: string | null; message: string }> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/next-stage`, {
    headers: {
      'x-user-id': userId,
    },
  });

  if (!res.ok) throw new Error('Failed to get next stage');
  return res.json();
}

export async function canAdvance(
  projectId: string,
  userId: string
): Promise<{ canAdvance: boolean; projectId: string }> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/can-advance`, {
    headers: {
      'x-user-id': userId,
    },
  });

  if (!res.ok) throw new Error('Failed to check if can advance');
  return res.json();
}
