// components/app-sidebar-p.tsx - VERSÃO RESPONSIVA
"use client";

import * as React from "react"
import { Home, Settings, User, Menu, X, Trash2, ListChecks, ChevronDown, Rocket, Users, FileText } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { deleteProject } from "@/app/projeto/dash/actions"
import { RocketLoading } from "@/components/rocket-loading"

interface AppSidebarProps {
  user?: {
    name: string;
    email: string;
  };
  onCardOpen?: (cardId: string) => void;
}

export function AppSidebar({ user, onCardOpen }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isTasksOpen, setIsTasksOpen] = React.useState(false);

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

  type MenuItem = {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    href?: string;
    active?: boolean;
    cardId?: string;
    expandable?: boolean;
    subitems?: { title: string; cardId?: string }[];
  };

  type MenuGroup = {
    title: string;
    items: MenuItem[];
  };

  const menuItems: MenuGroup[] = [
    {
      title: "Geral",
      items: [
        {
          title: "Dashboard",
          icon: Home,
          href: "/dashboard",
          active: pathname === "/dashboard",
        },
      ],
    },
    {
      title: "Desenvolvimento",
      items: [
        {
          title: "Roadmap",
          icon: ListChecks,
          expandable: true,
          cardId: "tasks",
          subitems: [
            {
              title: "Problema e Oportunidade",
              cardId: "etapa1",
            },
            {
              title: "Pesquisa de Mercado",
              cardId: "etapa2",
            },
            {
              title: "Proposta de Valor",
              cardId: "etapa3",
            },
            {
              title: "Modelo de Negócio",
              cardId: "etapa4",
            },
          ],
        },
        {
          title: "MVP",
          icon: Rocket,
          cardId: "etapa5",
        },
        {
          title: "Equipe",
          icon: Users,
          cardId: "equipe",
        },
        {
          title: "Relatórios",
          icon: FileText,
          cardId: "relatorios",
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
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
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

          <div className="flex flex-col items-center gap-3">
            {/* Logo IDEOR - Centralizado - 120px */}
            <div className="relative w-[120px] h-[120px] flex-shrink-0">
              <Image
                src="/assets/logo_branco.png"
                alt="IDEOR Logo"
                width={120}
                height={120}
                className="object-contain max-w-none"
                priority
              />
            </div>

            {/* Saudação */}
            {user && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Olá, <span className="font-semibold">{user.name}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Content */}
        <div className="flex-1 overflow-auto py-4">
          {menuItems.map((group, groupIndex) => (
            <div key={groupIndex} className="px-4 py-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-3">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item, itemIndex) => {
                  // Item expansível (Tasks)
                  if (item.expandable && item.subitems) {
                    return (
                      <Collapsible
                        key={itemIndex}
                        open={isTasksOpen}
                        onOpenChange={setIsTasksOpen}
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors text-sm",
                              "hover:bg-accent hover:text-accent-foreground text-foreground"
                            )}
                          >
                            {item.icon && <item.icon className="h-5 w-5" />}
                            <span className="flex-1 text-left">{item.title}</span>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                isTasksOpen && "rotate-180"
                              )}
                            />
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-8 space-y-1 mt-1">
                          {item.subitems.map((subitem, subIndex) => (
                            <button
                              key={subIndex}
                              onClick={() => {
                                if (onCardOpen && subitem.cardId) {
                                  onCardOpen(subitem.cardId);
                                }
                                setIsMobileOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-start gap-2 px-3 py-2 rounded-md transition-colors text-sm",
                                "hover:bg-accent hover:text-accent-foreground text-foreground"
                              )}
                            >
                              <span className="text-left">{subitem.title}</span>
                            </button>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  }

                  // Item normal
                  return (
                    <button
                      key={itemIndex}
                      onClick={() => {
                        if (item.cardId && onCardOpen) {
                          onCardOpen(item.cardId);
                          setIsMobileOpen(false);
                        } else if (item.href) {
                          router.push(item.href);
                          setIsMobileOpen(false);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors text-sm",
                        item.active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground text-foreground"
                      )}
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.title}</span>
                    </button>
                  );
                })}
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
    </>
  );
}