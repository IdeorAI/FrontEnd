// components/project-card-menu.tsx
// Spec 026 — overflow menu (3 pontinhos) dos cards de "Meus Projetos" no dashboard.
// Renderizado FORA do <a> do card (irmão do ProjectCardLink), com stopPropagation
// por segurança. Ações: Continuar a desenvolver / Abrir projeto / Renomear / Excluir.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  MoreVertical,
  ArrowRight,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type MenuTask = { status?: string; phase?: string | null };

interface ProjectCardMenuProps {
  projectId: string;
  projectName: string;
  tasks: MenuTask[];
  /** Aciona a edição inline do nome no card. */
  onRenameRequest: () => void;
}

/** Próxima etapa pendente = menor etapaN (1..5) não-'evaluated'; null se completo. */
function nextPendingStage(tasks: MenuTask[]): number | null {
  for (let n = 1; n <= 5; n++) {
    const done = tasks.some(
      (t) => t.phase === `etapa${n}` && t.status === "evaluated",
    );
    if (!done) return n;
  }
  return null;
}

export function ProjectCardMenu({
  projectId,
  projectName,
  tasks,
  onRenameRequest,
}: ProjectCardMenuProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const stop = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const goContinue = () => {
    const n = nextPendingStage(tasks);
    if (n) router.push(`/projeto/${projectId}/fase2/etapa${n}`);
    else router.push(`/projeto/dash?project_id=${projectId}`);
  };

  const goOpen = () => {
    router.push(`/projeto/dash?project_id=${projectId}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const supabase = createClient();
      // RLS projects_delete_own cobre o dono; FKs ON DELETE CASCADE apagam as filhas.
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      if (error) throw new Error(error.message);
      toast.success("Startup excluída.");
      setConfirmOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao excluir a startup.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={stop}
            onPointerDown={stop}
            aria-label="Ações do projeto"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={stop}
          className="w-52"
        >
          <DropdownMenuItem
            onSelect={() => goContinue()}
            className="cursor-pointer"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Continuar a desenvolver
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => goOpen()} className="cursor-pointer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir projeto
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onRenameRequest()}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Renomear
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              // Evita o foco/clique vazar para o card; abre o diálogo de confirmação.
              e.preventDefault();
              setConfirmOpen(true);
            }}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir startup
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent onClick={stop}>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir startup?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{projectName}&quot;? Todos os
              dados do projeto (etapas, documentos e análises) serão removidos.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
