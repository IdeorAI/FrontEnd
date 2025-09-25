// components/app-sidebar-p.tsx - VERSÃO RESPONSIVA
"use client";

import * as React from "react"
import { Lightbulb, Home, BarChart, Settings, User, Menu, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AppSidebarProps {
  user?: {
    name: string;
    email: string;
  };
  projectName?: string;
}

export function AppSidebar({ user, projectName }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const menuItems = [
    {
      title: "Geral",
      items: [
        {
          title: "Dashboard",
          icon: Home,
          href: "/dashboard",
          active: pathname === "/dashboard",
        },
        {
          title: "Ideia Inicial",
          icon: Lightbulb,
          href: "/idea/create",
          active: pathname === "/idea/create",
        },
      ],
    },
    {
      title: "Análise",
      items: [
        {
          title: "Métricas",
          icon: BarChart,
          href: "/metrics",
          active: pathname === "/metrics",
        },
      ],
    },
    {
      title: "Configurações",
      items: [
        {
          title: "Perfil",
          icon: User,
          href: "/profile",
          active: pathname === "/profile",
        },
        {
          title: "Configurações",
          icon: Settings,
          href: "/settings",
          active: pathname === "/settings",
        },
      ],
    },
  ];

  return (
    <>
      {/* Botão Hamburguer para Mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-background border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-screen w-64 border-r bg-background z-50 transition-transform lg:transform-none",
        "lg:block",
        isMobileOpen ? "transform-none" : "-translate-x-full"
      )}>
        {/* Header do Sidebar */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">{projectName || "Ideor"}</h2>
            {user && (
              <p className="text-sm text-muted-foreground truncate">
                Olá, {user.name}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-auto py-4">
          {menuItems.map((group, groupIndex) => (
            <div key={groupIndex} className="px-4 py-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-3">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => {
                      router.push(item.href);
                      setIsMobileOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors text-sm", // py-3 maior para mobile
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" /> {/* Ícones maiores */}
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo principal com margem responsiva */}
      <main className={cn(
        "min-h-screen transition-margin",
        "lg:ml-64", // Margem apenas em desktop
        isMobileOpen ? "ml-64" : "ml-0" // Margem apenas quando sidebar aberto em mobile
      )}>
        {/* Seu conteúdo aqui */}
      </main>
    </>
  );
}