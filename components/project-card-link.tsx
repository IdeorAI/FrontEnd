// components/project-card-link.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { RocketLoading } from "@/components/rocket-loading";

interface ProjectCardLinkProps {
  projectId: string;
  children: React.ReactNode;
}

export function ProjectCardLink({ projectId, children }: ProjectCardLinkProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = () => {
    setIsNavigating(true);
  };

  return (
    <>
      {isNavigating && <RocketLoading message="Carregando projeto..." />}
      <Link
        href={`/projeto/dash?project_id=${projectId}`}
        onClick={handleClick}
      >
        {children}
      </Link>
    </>
  );
}
