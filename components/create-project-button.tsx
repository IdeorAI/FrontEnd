// components/create-project-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RocketLoading } from "@/components/rocket-loading";

export function CreateProjectButton() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = () => {
    setIsNavigating(true);
    router.push("/idea/create");
  };

  return (
    <>
      {isNavigating && <RocketLoading message="Preparando seu novo projeto..." />}
      <Button
        type="button"
        onClick={handleClick}
        className="w-full sm:w-auto"
      >
        Criar uma nova Startup
      </Button>
    </>
  );
}
