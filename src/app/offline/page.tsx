'use client';

import { WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">Sin conexión</h1>
          <p className="text-sm text-muted-foreground">
            No hay conexión a internet. Algunas funciones pueden estar disponibles desde la
            caché.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
          >
            Reintentar
          </button>
        </CardContent>
      </Card>
    </main>
  );
}
