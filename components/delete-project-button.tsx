"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteProjectButtonProps {
  projectId: string
  projectName: string
  variant?: "icon" | "full"
  onDeleted?: () => void
}

export function DeleteProjectButton({
  projectId,
  projectName,
  variant = "icon",
  onDeleted,
}: DeleteProjectButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      // Delete tasks first to satisfy FK constraint
      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .eq("project_id", projectId)
      if (tasksError) throw tasksError

      // Then delete the project itself
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)

      if (error) throw error

      toast.success("Projeto excluído com sucesso")
      router.refresh()
      onDeleted?.()
    } catch (err) {
      toast.error("Erro ao excluir projeto")
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {variant === "full" ? (
          <Button variant="destructive" size="sm" disabled={isDeleting}>
            <Trash2 size={14} className="mr-2" />
            {isDeleting ? "Excluindo..." : "Excluir Projeto"}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label={`Excluir projeto ${projectName}`}
            disabled={isDeleting}
          >
            <Trash2 size={14} />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir &quot;{projectName}&quot;? Esta ação
            não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
