import Link from 'next/link';
import { Plus, Receipt } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatCLP, formatDate } from '@/lib/utils';

export default async function TicketsListPage() {
  await requireRole('supervisor');
  const supabase = createClient();

  const { data } = await supabase
    .from('purchase_tickets')
    .select('id, ticket_number, purchase_date, total, notes, suppliers(name), profiles(full_name)')
    .order('purchase_date', { ascending: false })
    .limit(100);

  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets de compra</h1>
          <p className="text-sm text-muted-foreground">
            Registro de compras con desglose por ítem y propiedad
          </p>
        </div>
        <Link href="/tickets/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo ticket
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-10 w-10" />}
          title="Sin tickets registrados"
          description="Registra tu primera compra de consumibles o elementos esporádicos."
          action={
            <Link href="/tickets/new">
              <Button>
                <Plus className="h-4 w-4" />
                Nuevo ticket
              </Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° ticket</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Registrado por</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">
                    <Link href={`/tickets/${t.id}`} className="hover:underline">
                      {t.ticket_number}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(t.purchase_date)}</TableCell>
                  <TableCell>{t.suppliers?.name ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.profiles?.full_name ?? '—'}
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCLP(t.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
