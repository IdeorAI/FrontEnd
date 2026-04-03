'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error('[Error Boundary] Erro capturado:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Algo deu errado!</h2>
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="gap-2"
            variant="default"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Voltar ao início
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 rounded-lg bg-muted p-4 text-left text-xs">
            <summary className="cursor-pointer font-medium">Detalhes do erro (dev)</summary>
            <pre className="mt-2 overflow-x-auto text-destructive">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
