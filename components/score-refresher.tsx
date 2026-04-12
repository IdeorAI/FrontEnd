"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface StaleProject {
  id: string;
  score: number | null;
  evaluatedTaskCount: number;
  userId: string;
}

interface ScoreRefresherProps {
  staleProjects: StaleProject[];
}

/**
 * Componente invisível que dispara recálculo de score para projetos
 * que têm tasks avaliadas mas ainda mostram score = 0.
 * Após recalcular, chama router.refresh() para invalidar o cache do dashboard.
 */
export function ScoreRefresher({ staleProjects }: ScoreRefresherProps) {
  const router = useRouter();

  useEffect(() => {
    if (staleProjects.length === 0) return;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const recalcAll = async () => {
      let anyUpdated = false;

      await Promise.all(
        staleProjects.map(async ({ id, userId }) => {
          try {
            const res = await fetch(
              `${API_BASE}/api/projects/${id}/recalculate-score`,
              { method: "POST", headers: { "x-user-id": userId } }
            );
            const data = await res.json();
            if (data.score > 0) anyUpdated = true;
          } catch {
            // silencioso — não bloqueia a UI
          }
        })
      );

      if (anyUpdated) {
        // Invalida o cache do router para que o Server Component re-execute
        router.refresh();
      }
    };

    recalcAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // roda só uma vez ao montar

  return null;
}
