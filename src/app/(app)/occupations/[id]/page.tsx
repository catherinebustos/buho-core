import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { requireRole, hasRoleAtLeast } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate, formatDateTime } from '@/lib/utils';
import { deleteOccupation } from '../actions';

export default async function OccupationDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const profile = await requireRole('supervisor');
  const canDelete = hasRoleAtLeast(profile.role, 'admin');
  const supabase = createClient();

  const { data: occupation } = await supabase
    .from('occupations')
    .select(
      'id, reservation_code, checkin_date, checkout_date, nights, notes, created_at, properties(id, nickname, title), profiles(full_name)'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!occupation) notFound();

  const o = occupation as any;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/occupations" />
      </div>

      {searchParams.error ? (
        <Alert variant="destructive">
          <AlertDescription>{searchParams.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Ocupación</p>
          <h1 className="font-mono text-2xl font-bold">{o.reservation_code}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{o.properties?.nickname ?? '—'}</Badge>
            <span>· {o.nights} {o.nights === 1 ? 'noche' : 'noches'}</span>
            <span>· Registrado por {o.profiles?.full_name ?? '—'}</span>
          </div>
        </div>
        {canDelete ? (
          <form action={deleteOccupation}>
            <input type="hidden" name="id" value={o.id} />
            <Button type="submit" variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </form>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalle</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Propiedad</p>
            <p className="font-medium">{o.properties?.title ?? o.properties?.nickname ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Registrada el</p>
            <p className="font-medium">{formatDateTime(o.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Check-in</p>
            <p className="font-medium">{formatDate(o.checkin_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Check-out</p>
            <p className="font-medium">{formatDate(o.checkout_date)}</p>
          </div>
        </CardContent>
      </Card>

      {o.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">{o.notes}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
