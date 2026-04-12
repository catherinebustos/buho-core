import Link from 'next/link';
import { CheckCircle2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function VisitSuccessPage({
  params,
  searchParams
}: {
  params: { token: string };
  searchParams: { visitId?: string };
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold">Visita registrada</h1>
          <p className="text-sm text-muted-foreground">
            Gracias. Tu registro quedó guardado y disponible para el equipo.
          </p>
          <div className="flex w-full flex-col gap-2 pt-2">
            {searchParams.visitId ? (
              <Link
                href={`/v/${params.token}/photos/${searchParams.visitId}`}
                className="w-full"
              >
                <Button variant="outline" className="w-full gap-2">
                  <Camera className="h-4 w-4" />
                  Agregar fotos de la visita
                </Button>
              </Link>
            ) : null}
            <Link href={`/v/${params.token}`} className="w-full">
              <Button variant="outline" className="w-full">
                Registrar otra visita aquí
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">Ir al dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
