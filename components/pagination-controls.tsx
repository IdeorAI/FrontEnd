'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  total: number
  pageSize: number
}

export function PaginationControls({ page, total, pageSize }: Props) {
  const router = useRouter()
  const sp = useSearchParams()
  const totalPages = Math.ceil(total / pageSize)

  function goTo(p: number) {
    const params = new URLSearchParams(sp.toString())
    params.set('page', String(p))
    router.push(`/dashboard?${params}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="icon"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
