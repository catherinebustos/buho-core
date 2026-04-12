import Link from 'next/link';
import { Plus, Wrench } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatCLP } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { hasRoleAtLeast } from '@/lib/auth';

export const CATEGORY_LABELS: Record<string, string> = {
  electricidad:    'Electricidad',
  gasfiteria:      'Gasfitería',
  carpinteria:     'Carpintería',
  pintura:         'Pintura',
  cerrajeria:      'Cerrajería',
  jardineria:      'Jardinería',
  estructural:     'Estructural',
  climatizacion:   'Climatización',
  limpieza_especial: 'Limpieza especial',
  otro:            'Otro',
};

export const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pendiente:     { label: 'Pendiente',     classes: 'bg-zinc-100 text-zinc-700' },
  presupuestado: { label: 'Presupuestado', classes: 'bg-blue-100 text-blue-700' },
  aprobado:      { label: 'Aprobado',      classes: 'bg-indigo-100 text-indigo-700' },
  en_proceso:    { label: 'En proceso',    classes: 'bg-amber-100 text-amber-700' },
  completado:    { label: 'Completado',    classes: 'bg-green-100 text-green-700' },
  cancelado:     { label: 'Cancelado',     classes: 'bg-red-100 text-red-700' },
};

export const URGENCY_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
  baja:  { label: 'Baja',  classes: 'text-green-600',  dot: 'bg-green-400' },
  media: { label: 'Media', classes: 'text-amber-600',  dot: 'bg-amber-400' },
  alta:  { label: 'Alta',  classes: 'text-red-600',    dot: 'bg-red-500' },
};

export default async function MaintenancePage() {
  const profile = await requireRole('maintenance');
  const supabase = createClient();
  const isSupervisorPlus = hasRoleAtLeast(profile.role, 'supervisor');

  let query = supabase
    .from('maintenance_requests' as any)
    .select(`
      id, title, category, status, urgency, created_at, scheduled_date,
      estimated_cost, actual_cost,
      reported_by, assigned_to,
      properties:property_id ( nickname ),
      reporter:reported_by ( full_name ),
      assignee:assigned_to ( full_name )
    `)
    .order('created_at', { ascending: false });

  // Workers de mantenimiento solo ven las suyas
  if (!isSupervisorPlus) {
    query = query.or(`assigned_to.eq.${profile.id},reported_by.eq.${profile.id}`);
  }

  const { data: rows } = await query;
  const items = (rows ?? []) as any[];

  // KPI rápido: pending / in-progress / completed
  const pending    = items.filter(i => ['pendiente', 'presupuestado', 'aprobado'].includes(i.status)).length;
  const inProgress = items.filter(i => i.status === 'en_proceso').length;
  const completed  = items.filter(i => i.status === 'completado').length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Gestión operacional</p>
          <h1 className="text-2xl font-bold">Mantenimiento</h1>
          <p className="text-sm text-muted-foreground">{items.length} solicitudes registradas</p>
        </div>
        {isSupervisorPlus && (
          <Link
            href="/maintenance/new"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva solicitud
          </Link>
        )}
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Pendientes / Aprobadas', value: pending,    classes: 'text-amber-600' },
          { label: 'En proceso',             value: inProgress, classes: 'text-blue-600' },
          { label: 'Completadas',            value: completed,  classes: 'text-green-600' },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="pt-4 pb-3">
              <p className={`text-2xl font-bold tabular-nums ${k.classes}`}>{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Solicitudes de mantenimiento</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Wrench className="h-10 w-10" />}
                title="Sin solicitudes"
                description="No hay solicitudes de mantenimiento registradas todavía."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-zinc-50/50 text-xs text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Solicitud</th>
                    <th className="px-4 py-3 text-left font-medium">Propiedad</th>
                    <th className="px-4 py-3 text-left font-medium">Categoría</th>
                    <th className="px-4 py-3 text-left font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Costo</th>
                    <th className="px-4 py-3 text-right font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const statusCfg  = STATUS_CONFIG[item.status]  ?? STATUS_CONFIG.pendiente;
                    const urgencyCfg = URGENCY_CONFIG[item.urgency] ?? URGENCY_CONFIG.media;
                    const prop = (item.properties as any)?.nickname ?? '—';
                    const cost = item.actual_cost ?? item.estimated_cost;
                    return (
                      <tr key={item.id} className="border-b border-border last:border-0 hover:bg-zinc-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${urgencyCfg.dot}`} />
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <div className="mt-0.5 pl-4 text-[11px] text-muted-foreground">
                            {(item.assignee as any)?.full_name
                              ? `Asignado: ${(item.assignee as any).full_name}`
                              : 'Sin asignar'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{prop}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {CATEGORY_LABELS[item.category] ?? item.category}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusCfg.classes}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {cost ? formatCLP(cost) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/maintenance/${item.id}`}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
