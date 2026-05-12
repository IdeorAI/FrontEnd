"use client";

import { AppSidebar } from "@/components/app-sidebar-p";
import { ChatProvider } from "@/components/chat/chat-provider";
import { ChatFab } from "@/components/chat/chat-fab";

interface ProjetoLayoutWrapperProps {
  user: {
    name: string;
    email: string;
  };
  children: React.ReactNode;
}

export function ProjetoLayoutWrapper({
  user,
  children,
}: ProjetoLayoutWrapperProps) {
  const handleCardOpen = (cardId: string) => {
    // Dispatch custom event to communicate with dash page
    window.dispatchEvent(
      new CustomEvent("openCard", { detail: { cardId } })
    );
  };

  return (
    <ChatProvider>
      <div className="flex min-h-screen">
        <AppSidebar
          user={user}
          onCardOpen={handleCardOpen}
        />
        <div className="flex-1 lg:ml-64">
          <div className="h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
      <ChatFab />
    </ChatProvider>
  );
}
