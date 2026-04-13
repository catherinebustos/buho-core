import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Trash2, Pencil, Package } from 'lucide-react';
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
  const canEdit = hasRoleAtLeast(profile.role, 'supervisor');
  const canDelete = hasRoleAtLeast(profile.role, 'supervisor');
  const supabase = createClient();

  const { data: ticket } = await supabase
    .from('purchase_tickets')
    .select(
      'id, ticket_number, purchase_date, total, notes, suppliers(name), profiles(full_name), properties(nickname), created_at'
    )
    .eq('id', params.id)
    .maybeSingle();

  if (!ticket) notFound();

  const { data: items } = await supabase
    .from('ticket_items')
    .select(
      'id, quantity, unit_price, subtotal, notes, items(name, unit, units_per_package), properties(nickname)'
    )
    .eq('ticket_id', params.id);

  const rows = (items as any[]) ?? [];
  const t = ticket as any;

  // Recalcular total desde líneas si el valor en DB es 0 (por si el trigger no disparó aún)
  const computedTotal = rows.reduce((sum: number, r: any) => sum + (Number(r.subtotal) || 0), 0);
  const displayTotal = Number(t.total) > 0 ? Number(t.total) : computedTotal;

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
            {t.properties?.nickname && (
              <Badge variant="secondary">{t.properties.nickname}</Badge>
            )}
            <span>· {formatDate(t.purchase_date)}</span>
            <span>· Registrado por {t.profiles?.full_name ?? '—'}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Link href={`/tickets/${t.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            </Link>
          )}
          {canDelete && (
            <form action={deleteTicket}>
              <input type="hidden" name="id" value={t.id} />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </form>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalle de ítems</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ítem</TableHead>
                <TableHead className="text-right">Cant.</TableHead>
                <TableHead className="text-right">Contenido/unidad</TableHead>
                <TableHead className="text-right">Total unidades</TableHead>
                <TableHead className="text-right">Precio unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((line: any) => {
                const uPkg: number = line.items?.units_per_package ?? 1;
                const qty: number = Number(line.quantity) || 0;
                const totalUnits = qty * uPkg;
                return (
                  <TableRow key={line.id}>
                    <TableCell>
                      <div className="font-medium">{line.items?.name ?? '—'}</div>
                      {line.notes && (
                        <div className="text-xs text-muted-foreground">{line.notes}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {line.quantity}
                      <div className="text-xs text-muted-foreground">
                        {line.items?.unit ?? 'unidad'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {uPkg > 1 ? (
                        <div className="flex items-center justify-end gap-1 text-blue-600 dark:text-blue-400">
                          <Package className="h-3 w-3" />
                          {uPkg} {line.items?.unit ?? 'u.'}/unidad
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {uPkg > 1 ? (
                        <>
                          {totalUnits}{' '}
                          <span className="text-xs font-normal text-muted-foreground">
                            {line.items?.unit ?? 'u.'}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCLP(line.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCLP(line.subtotal)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end gap-3 border-t border-border p-4">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="text-2xl font-bold tabular-nums">{formatCLP(displayTotal)}</span>
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
