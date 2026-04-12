import Link from 'next/link';
import { Plus, CalendarCheck } from 'lucide-react';
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
import { formatDate } from '@/lib/utils';

export default async function OccupationsListPage() {
  await requireRole('supervisor');
  const supabase = createClient();

  const { data } = await supabase
    .from('occupations')
    .select(
      'id, reservation_code, checkin_date, checkout_date, nights, properties(nickname), profiles(full_name)'
    )
    .order('checkin_date', { ascending: false })
    .limit(200);

  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ocupaciones</h1>
          <p className="text-sm text-muted-foreground">
            Registro de reservas por propiedad para el cálculo de KPIs mensuales
          </p>
        </div>
        <Link href="/occupations/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nueva ocupación
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="h-10 w-10" />}
          title="Sin ocupaciones registradas"
          description="Registra tu primera reserva para empezar a medir ocupación y rotación."
          action={
            <Link href="/occupations/new">
              <Button>
                <Plus className="h-4 w-4" />
                Nueva ocupación
              </Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Propiedad</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead className="text-right">Noches</TableHead>
                <TableHead>Registró</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">
                    <Link href={`/occupations/${o.id}`} className="hover:underline">
                      {o.reservation_code}
                    </Link>
                  </TableCell>
                  <TableCell>{o.properties?.nickname ?? '—'}</TableCell>
                  <TableCell>{formatDate(o.checkin_date)}</TableCell>
                  <TableCell>{formatDate(o.checkout_date)}</TableCell>
                  <TableCell className="text-right tabular-nums">{o.nights}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.profiles?.full_name ?? '—'}
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
