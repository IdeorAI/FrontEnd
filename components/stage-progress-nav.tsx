"use client";

import { useRouter } from "next/navigation";
import { StageProgress } from "@/components/stage-progress";

interface StageProgressNavProps {
  projectId: string;
  currentStage: string;
  completedStages: string[];
}

export function StageProgressNav({
  projectId,
  currentStage,
  completedStages,
}: StageProgressNavProps) {
  const router = useRouter();

  return (
    <StageProgress
      currentStage={currentStage}
      completedStages={completedStages}
      onStageClick={(phase) => {
        router.push(`/projeto/${projectId}/fase2/${phase}`);
      }}
    />
  );
}
