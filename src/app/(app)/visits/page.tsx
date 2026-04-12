import Link from 'next/link';
import { ClipboardList, QrCode } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterSelect } from '@/components/ui/filter-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';

export default async function VisitsListPage({
  searchParams
}: {
  searchParams: { property?: string; type?: string };
}) {
  await requireRole('cleaner');
  const supabase = createClient();

  let query = supabase
    .from('visits')
    .select(
      'id, visit_at, via_qr, properties(nickname), visit_types(name), profiles(full_name)'
    )
    .order('visit_at', { ascending: false })
    .limit(200);

  if (searchParams.property) query = query.eq('property_id', searchParams.property);
  if (searchParams.type) query = query.eq('visit_type_id', searchParams.type);

  const [{ data: visits }, { data: properties }, { data: visitTypes }] = await Promise.all([
    query,
    supabase.from('properties').select('id, nickname').order('nickname'),
    supabase.from('visit_types').select('id, name').eq('active', true).order('sort_order')
  ]);

  const rows = (visits ?? []) as any[];
  const props = (properties ?? []) as { id: string; nickname: string }[];
  const types = (visitTypes ?? []) as { id: string; name: string }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Check-lists completados</h1>
        <p className="text-sm text-muted-foreground">
          Historial de check-lists y visitas registradas vía QR o manualmente por el equipo
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          <FilterSelect
            name="property"
            defaultValue={searchParams.property ?? ''}
            placeholder="Todas las propiedades"
            options={[
              { label: 'Todas las propiedades', value: '' },
              ...props.map(p => ({ label: p.nickname, value: p.id }))
            ]}
          />

          <FilterSelect
            name="type"
            defaultValue={searchParams.type ?? ''}
            placeholder="Todos los tipos"
            options={[
              { label: 'Todos los tipos', value: '' },
              ...types.map(t => ({ label: t.name, value: t.id }))
            ]}
          />
        </div>
        <button
          type="submit"
          className="h-10 rounded-md border border-input bg-background px-4 text-sm hover:bg-accent"
        >
          Filtrar
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="Sin visitas registradas"
          description="Las visitas aparecen acá cuando el equipo ejecuta una limpieza o chequeo vía QR."
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Propiedad</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ejecutó</TableHead>
                <TableHead>Origen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="text-xs">
                    <Link href={`/visits/${v.id}`} className="hover:underline">
                      {formatDateTime(v.visit_at)}
                    </Link>
                  </TableCell>
                  <TableCell>{v.properties?.nickname ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{v.visit_types?.name ?? '—'}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {v.profiles?.full_name ?? '—'}
                  </TableCell>
                  <TableCell>
                    {v.via_qr ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <QrCode className="h-3 w-3" />
                        QR
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Manual</span>
                    )}
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
