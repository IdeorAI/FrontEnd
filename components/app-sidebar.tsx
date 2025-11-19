// components/app-sidebar.tsx
"use client";

import * as React from "react";
import {
  Home,
  PlusSquare,
  Store,
  Trophy,
  Settings,
  User,
  CreditCard,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface AppSidebarProps {
  user?: { name: string; email: string };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const items = [
    { title: "Início", icon: Home, href: "/dashboard" },
    { title: "Novo Projeto", icon: PlusSquare, href: "/idea/create" },
    { title: "Marketplace", icon: Store, href: "/marketplace" },
    { title: "Ranking", icon: Trophy, href: "/ranking" },
    { title: "Configurações", icon: Settings, href: "/configuracoes" },
    { title: "Perfil", icon: User, href: "/perfil" },
    { title: "Planos", icon: CreditCard, href: "/planos" },
    { title: "Contato", icon: Mail, href: "/contato" },
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-background border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 border-r bg-background z-50 transition-transform lg:transform-none",
          "lg:block",
          isMobileOpen ? "transform-none" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center justify-center flex-1">
            {/* Logo IDEOR - Aumentado e centralizado */}
            <div className="relative w-[80px] h-[80px]">
              <Image
                src="/assets/logo_branco.png"
                alt="IDEOR Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden flex-shrink-0"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-auto py-4 px-3 space-y-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setIsMobileOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
