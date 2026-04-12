import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/ui/back-button';
import { requireRole, hasRoleAtLeast } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatDateTime } from '@/lib/utils';
import { updateDamageStatus } from '../actions';

const URGENCY_LABEL: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta'
};

const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
  descartado: 'Descartado'
};

export default async function DamageDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const profile = await requireRole('cleaner');
  const canManage = hasRoleAtLeast(profile.role, 'supervisor');
  const supabase = createClient();

  const { data: damage } = await supabase
    .from('damage_reports')
    .select(
      'id, description, urgency, status, reported_at, resolved_at, resolution_notes, visit_id, properties(id, nickname, title), profiles(full_name)'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!damage) notFound();

  const d = damage as any;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/damages" />
      </div>

      {searchParams.error ? (
        <Alert variant="destructive">
          <AlertDescription>{searchParams.error}</AlertDescription>
        </Alert>
      ) : null}

      <div>
        <p className="text-xs text-muted-foreground">Daño reportado</p>
        <h1 className="text-2xl font-bold">{d.properties?.nickname ?? '—'}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{URGENCY_LABEL[d.urgency]}</Badge>
          <Badge>{STATUS_LABEL[d.status]}</Badge>
          <span>· Reportado {formatDateTime(d.reported_at)}</span>
          <span>· por {d.profiles?.full_name ?? '—'}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Descripción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm">{d.description}</p>
          {d.visit_id ? (
            <Link
              href={`/visits/${d.visit_id}`}
              className="inline-block text-xs text-primary hover:underline"
            >
              Ver visita asociada →
            </Link>
          ) : null}
        </CardContent>
      </Card>

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gestión</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateDamageStatus} className="space-y-4">
              <input type="hidden" name="id" value={d.id} />
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select id="status" name="status" defaultValue={d.status} required>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="descartado">Descartado</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolution_notes">Notas de resolución</Label>
                <Textarea
                  id="resolution_notes"
                  name="resolution_notes"
                  rows={3}
                  defaultValue={d.resolution_notes ?? ''}
                  placeholder="Acciones tomadas, costos, proveedor contactado..."
                />
              </div>
              {d.resolved_at ? (
                <p className="text-xs text-muted-foreground">
                  Cerrado el {formatDateTime(d.resolved_at)}
                </p>
              ) : null}
              <div className="flex justify-end">
                <Button type="submit">Guardar cambios</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
