"use client";

import { AppSidebar } from "@/components/app-sidebar-p";

interface ProjetoLayoutWrapperProps {
  user: {
    name: string;
    email: string;
  };
  projectName: string;
  children: React.ReactNode;
}

export function ProjetoLayoutWrapper({
  user,
  projectName,
  children,
}: ProjetoLayoutWrapperProps) {
  const handleCardOpen = (cardId: string) => {
    // Dispatch custom event to communicate with dash page
    window.dispatchEvent(
      new CustomEvent("openCard", { detail: { cardId } })
    );
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar
        user={user}
        projectName={projectName}
        onCardOpen={handleCardOpen}
      />
      <div className="flex-1 lg:ml-64">
        <div className="h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <main className="p-4 lg:pl-4 lg:pr-6">{children}</main>
      </div>
    </div>
  );
}
