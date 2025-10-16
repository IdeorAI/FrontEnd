// components/app-sidebar-p.tsx - VERSÃO RESPONSIVA
"use client";

import * as React from "react"
import { Lightbulb, Home, BarChart, Settings, User, Menu, X, Trash2 } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteProject } from "@/app/projeto/dash/actions"
import { RocketLoading } from "@/components/rocket-loading"

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
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteProject = async () => {
    const projectId = searchParams.get("project_id");
    if (!projectId) {
      console.error("Nenhum project_id encontrado na URL");
      alert("ID do projeto não encontrado na URL");
      setShowDeleteDialog(false);
      return;
    }

    setIsDeleting(true);
    try {
      console.log("Excluindo projeto:", projectId);
      await deleteProject(projectId);
      // O redirect acontece dentro da action
    } catch (error) {
      // Ignorar erro NEXT_REDIRECT pois é esperado durante redirecionamento
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        return;
      }
      console.error("Erro ao excluir projeto:", error);
      alert(`Erro ao excluir o projeto: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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
      {/* Loading de exclusão */}
      {isDeleting && <RocketLoading message="Excluindo projeto..." />}

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

          {/* Botão Excluir Projeto */}
          <div className="px-4 py-2 mt-4 border-t pt-4">
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-5 w-5 mr-3" />
              Excluir Projeto
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto será excluído permanentemente do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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