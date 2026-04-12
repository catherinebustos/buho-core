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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatCLP, formatDate } from '@/lib/utils';
import { deleteTicket } from '../actions';

export default async function TicketDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const profile = await requireRole('supervisor');
  const canDelete = hasRoleAtLeast(profile.role, 'admin');
  const supabase = createClient();

  const { data: ticket } = await supabase
    .from('purchase_tickets')
    .select(
      'id, ticket_number, purchase_date, total, notes, suppliers(name), profiles(full_name), created_at'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!ticket) notFound();

  const { data: items } = await supabase
    .from('ticket_items')
    .select(
      'id, quantity, unit_price, subtotal, notes, items(name, unit), properties(nickname), item_categories:items(item_categories(name, kind))'
    )
    .eq('ticket_id', params.id);

  const rows = (items as any[]) ?? [];
  const t = ticket as any;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/tickets" />
      </div>

      {searchParams.error ? (
        <Alert variant="destructive">
          <AlertDescription>{searchParams.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Ticket</p>
          <h1 className="font-mono text-2xl font-bold">{t.ticket_number}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{t.suppliers?.name ?? '—'}</Badge>
            <span>· {formatDate(t.purchase_date)}</span>
            <span>· Registrado por {t.profiles?.full_name ?? '—'}</span>
          </div>
        </div>
        {canDelete ? (
          <form action={deleteTicket}>
            <input type="hidden" name="id" value={t.id} />
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ítem</TableHead>
                <TableHead>Propiedad</TableHead>
                <TableHead className="text-right">Cant.</TableHead>
                <TableHead className="text-right">Precio unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <div className="font-medium">{line.items?.name ?? '—'}</div>
                    <div className="text-xs text-muted-foreground">{line.items?.unit ?? ''}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {line.properties?.nickname ?? (
                      <span className="text-muted-foreground">Gasto general</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{line.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCLP(line.unit_price)}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCLP(line.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end gap-3 border-t border-border p-4">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="text-2xl font-bold tabular-nums">{formatCLP(t.total)}</span>
          </div>
        </CardContent>
      </Card>

      {t.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-sm">{t.notes}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
