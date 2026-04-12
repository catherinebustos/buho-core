import { requireRole, ROLE_LABELS } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';
import type { UserRole } from '@/lib/types/database';

const ACTION_VARIANT: Record<string, 'default' | 'outline' | 'destructive'> = {
  INSERT: 'default',
  UPDATE: 'outline',
  DELETE: 'destructive'
};

const TABLE_LABELS: Record<string, string> = {
  profiles: 'Usuarios',
  properties: 'Propiedades',
  property_assignments: 'Asignaciones',
  property_types: 'Tipos prop.',
  item_categories: 'Cat. ítems',
  items: 'Ítems',
  suppliers: 'Proveedores',
  visit_types: 'Tipos visita',
  purchase_tickets: 'Tickets',
  ticket_items: 'Líneas ticket',
  visits: 'Visitas',
  visit_items_used: 'Ítems visita',
  damage_reports: 'Daños',
  occupations: 'Ocupaciones'
};

export default async function AuditLogPage({
  searchParams
}: {
  searchParams: { table?: string; action?: string; offset?: string };
}) {
  await requireRole('super_admin');
  const supabase = createClient();

  const offset = Number(searchParams.offset ?? '0');
  const PAGE = 100;

  let query = supabase
    .from('audit_log' as any)
    .select('id, occurred_at, user_id, user_role, action, table_name, record_id')
    .order('occurred_at', { ascending: false })
    .range(offset, offset + PAGE - 1);

  if (searchParams.table) query = query.eq('table_name', searchParams.table);
  if (searchParams.action) query = query.eq('action', searchParams.action);

  const { data } = await query;
  const rows = (data ?? []) as any[];

  // Hydrate user names in one query
  const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
  let userNames: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds as string[]);
    userNames = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p.full_name]));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Auditoría</h1>
        <p className="text-sm text-muted-foreground">
          Registro inmutable de todas las operaciones críticas del sistema
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Tabla</label>
          <select
            name="table"
            defaultValue={searchParams.table ?? ''}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Todas</option>
            {Object.entries(TABLE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Acción</label>
          <select
            name="action"
            defaultValue={searchParams.action ?? ''}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Todas</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
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
          icon={<ShieldCheck className="h-10 w-10" />}
          title="Sin registros de auditoría"
          description="Los eventos aparecerán aquí en cuanto se realicen operaciones en el sistema."
        />
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Tabla</TableHead>
                  <TableHead className="font-mono text-xs">ID Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{formatDateTime(r.occurred_at)}</TableCell>
                    <TableCell className="text-sm">
                      {r.user_id ? (userNames[r.user_id] ?? r.user_id.slice(0, 8)) : '—'}
                    </TableCell>
                    <TableCell>
                      {r.user_role ? (
                        <Badge variant="outline">
                          {ROLE_LABELS[r.user_role as UserRole]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ACTION_VARIANT[r.action] ?? 'outline'}>
                        {r.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{TABLE_LABELS[r.table_name] ?? r.table_name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.record_id?.slice(0, 8) ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex items-center justify-end gap-3 text-sm">
            {offset > 0 ? (
              <a
                href={`?table=${searchParams.table ?? ''}&action=${searchParams.action ?? ''}&offset=${offset - PAGE}`}
                className="rounded-md border border-input px-3 py-1.5 hover:bg-accent"
              >
                ← Anterior
              </a>
            ) : null}
            {rows.length === PAGE ? (
              <a
                href={`?table=${searchParams.table ?? ''}&action=${searchParams.action ?? ''}&offset=${offset + PAGE}`}
                className="rounded-md border border-input px-3 py-1.5 hover:bg-accent"
              >
                Siguiente →
              </a>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
