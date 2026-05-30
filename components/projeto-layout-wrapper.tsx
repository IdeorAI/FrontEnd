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
        <div className="flex-1 lg:ml-64 min-w-0">
          <div className="h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          {/* pt-16 no mobile abre espaço para o botão hambúrguer flutuante (top-4 left-4) */}
          <main className="pt-16 px-3 pb-3 lg:p-4 lg:pt-4 max-w-[1600px] mx-auto">{children}</main>
        </div>
      </div>
      <ChatFab />
    </ChatProvider>
  );
}
