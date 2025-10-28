// API client para projetos
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Project {
  id: string;
  name: string;
  description?: string;
  score: number;
  valuation: number;
  currentPhase: string;
  category?: string;
  productStructure?: string;
  targetAudience?: string;
  generatedOptions?: string[];
  progressBreakdown?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  tasksCount: number;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  category?: string;
  productStructure?: string;
  targetAudience?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  category?: string;
  productStructure?: string;
  targetAudience?: string;
  score?: number;
  valuation?: number;
}

export async function getProjects(userId: string): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    headers: {
      'x-user-id': userId,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function getProject(projectId: string, userId: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}`, {
    headers: {
      'x-user-id': userId,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

export async function createProject(data: CreateProjectDto, userId: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function updateProject(
  projectId: string,
  data: UpdateProjectDto,
  userId: string
): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function changePhase(
  projectId: string,
  newPhase: string,
  userId: string
): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/phase`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({ newPhase }),
  });

  if (!res.ok) throw new Error('Failed to change phase');
  return res.json();
}
