import Link from 'next/link';
import { notFound } from 'next/navigation';
import { QrCode, AlertTriangle } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';

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

export default async function VisitDetailPage({ params }: { params: { id: string } }) {
  await requireRole('cleaner');
  const supabase = createClient();

  const { data: visit } = await supabase
    .from('visits')
    .select(
      'id, visit_at, via_qr, notes, properties(id, nickname, title), visit_types(name), profiles(full_name)'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!visit) notFound();

  const [{ data: itemsUsed }, { data: damages }] = await Promise.all([
    supabase
      .from('visit_items_used')
      .select('id, quantity, notes, items(name, unit)')
      .eq('visit_id', params.id),
    supabase
      .from('damage_reports')
      .select('id, description, urgency, status, reported_at')
      .eq('visit_id', params.id)
      .order('reported_at', { ascending: false })
  ]);

  const v = visit as any;
  const used = (itemsUsed ?? []) as any[];
  const dmg = (damages ?? []) as any[];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/visits" />
      </div>

      <div>
        <p className="text-xs text-muted-foreground">Visita</p>
        <h1 className="text-2xl font-bold">{formatDateTime(v.visit_at)}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{v.properties?.nickname ?? '—'}</Badge>
          <Badge variant="outline">{v.visit_types?.name ?? '—'}</Badge>
          <span>· {v.profiles?.full_name ?? '—'}</span>
          {v.via_qr ? (
            <span className="inline-flex items-center gap-1 text-xs">
              <QrCode className="h-3 w-3" />
              vía QR
            </span>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ítems utilizados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {used.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No se registraron ítems en esta visita.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ítem</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {used.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.items?.name ?? '—'}</div>
                      <div className="text-xs text-muted-foreground">{u.items?.unit ?? ''}</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{u.quantity}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.notes ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {dmg.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Daños reportados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dmg.map((d) => (
              <Link
                key={d.id}
                href={`/damages/${d.id}`}
                className="block rounded-md border border-border p-3 hover:bg-accent"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm">{d.description}</p>
                  <div className="flex shrink-0 gap-2">
                    <Badge variant="outline">{URGENCY_LABEL[d.urgency] ?? d.urgency}</Badge>
                    <Badge>{STATUS_LABEL[d.status] ?? d.status}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {v.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">{v.notes}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
