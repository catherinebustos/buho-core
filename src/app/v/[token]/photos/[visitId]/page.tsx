'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, CheckCircle2 } from 'lucide-react';
import { PhotoUploader } from '@/components/storage/photo-uploader';
import { BUCKETS, visitPhotoPath } from '@/lib/supabase/storage';
import { saveVisitPhoto } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STAGES = [
  { value: 'antes', label: 'Antes' },
  { value: 'durante', label: 'Durante' },
  { value: 'despues', label: 'Después' },
  { value: 'otro', label: 'Otro' }
];

export default function VisitPhotosPage({
  params
}: {
  params: { token: string; visitId: string };
}) {
  const [stage, setStage] = useState('despues');
  const [uploaded, setUploaded] = useState(0);

  return (
    <main className="min-h-dvh bg-background pb-16">
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/v/${params.token}/success?visitId=${params.visitId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-buho-500" />
            <p className="font-semibold">Fotos de la visita</p>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-4">
        {uploaded > 0 ? (
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {uploaded} foto{uploaded !== 1 ? 's' : ''} subida{uploaded !== 1 ? 's' : ''} correctamente
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Momento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStage(s.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    stage === s.value
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-input hover:bg-accent'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subir foto</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUploader
              bucket={BUCKETS.VISIT_PHOTOS}
              buildPath={(filename) => visitPhotoPath(params.visitId, stage, filename)}
              onUploaded={async (path) => {
                await saveVisitPhoto(params.visitId, path, stage);
                setUploaded((n) => n + 1);
              }}
              label="Seleccionar foto"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Sube todas las que necesites. Cada foto se sube individualmente.
            </p>
          </CardContent>
        </Card>

        <Link href="/dashboard" className="block">
          <Button className="w-full">Finalizar y volver al dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
