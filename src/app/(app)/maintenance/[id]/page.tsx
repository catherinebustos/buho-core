import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireRole, hasRoleAtLeast } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { formatCLP } from '@/lib/utils';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateMaintenanceRequest } from '../actions';
import { CATEGORY_LABELS, STATUS_CONFIG, URGENCY_CONFIG } from '../page';

const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
function fmtDate(d: string | null) {
  if (!d) return '—';
  const dt = new Date(d);
  return `${dt.getUTCDate()} ${MONTHS_ES[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
}

export default async function MaintenanceDetailPage({ params }: { params: { id: string } }) {
  const profile = await requireRole('maintenance');
  const supabase = createClient();
  const isSupervisorPlus = hasRoleAtLeast(profile.role, 'supervisor');

  const { data: raw } = await supabase
    .from('maintenance_requests' as any)
    .select(`
      *,
      properties:property_id ( id, nickname, title ),
      reporter:reported_by ( full_name ),
      assignee:assigned_to ( full_name ),
      damage:damage_report_id ( id, description )
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (!raw) notFound();
  const item = raw as any;

  const isAssigned = item.assigned_to === profile.id;
  const canEdit    = isSupervisorPlus || isAssigned;

  // Para el form de edición: cargar propiedades y staff
  const [{ data: properties }, { data: staff }] = await Promise.all([
    isSupervisorPlus
      ? supabase.from('properties').select('id, nickname').eq('status', 'activa').order('nickname')
      : { data: [] },
    isSupervisorPlus
      ? supabase.from('profiles').select('id, full_name, role').eq('active', true)
          .in('role', ['maintenance', 'supervisor', 'admin', 'super_admin']).order('full_name')
      : { data: [] },
  ]);

  const props   = (properties ?? []) as any[];
  const workers = (staff      ?? []) as any[];

  const statusCfg  = STATUS_CONFIG[item.status]  ?? STATUS_CONFIG.pendiente;
  const urgencyCfg = URGENCY_CONFIG[item.urgency] ?? URGENCY_CONFIG.media;

  const updateWithId = updateMaintenanceRequest.bind(null, params.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/maintenance" />
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Solicitud de mantenimiento</p>
          <h1 className="text-xl font-bold">{item.title}</h1>
          <p className="text-sm text-muted-foreground">
            {(item.properties as any)?.nickname} · {CATEGORY_LABELS[item.category] ?? item.category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${urgencyCfg.classes}`}>
            Urgencia {urgencyCfg.label}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusCfg.classes}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Info (3/5) */}
        <div className="space-y-4 lg:col-span-3">
          {item.description && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Descripción</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{item.description}</p>
              </CardContent>
            </Card>
          )}

          {item.notes && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Notas internas</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{item.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Daño vinculado */}
          {item.damage && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Daño vinculado</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-700">{(item.damage as any).description}</p>
                <Link
                  href={`/damages/${(item.damage as any).id}`}
                  className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                >
                  Ver reporte de daño →
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar (2/5) */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Detalles</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Propiedad</span>
                <span className="font-medium">{(item.properties as any)?.nickname ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reportado por</span>
                <span className="font-medium">{(item.reporter as any)?.full_name ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asignado a</span>
                <span className="font-medium">{(item.assignee as any)?.full_name ?? 'Sin asignar'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha programada</span>
                <span className="font-medium">{fmtDate(item.scheduled_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completado</span>
                <span className="font-medium">{fmtDate(item.completed_date)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-muted-foreground">Costo estimado</span>
                <span className="font-medium">
                  {item.estimated_cost ? formatCLP(item.estimated_cost) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Costo real</span>
                <span className="font-semibold text-zinc-900">
                  {item.actual_cost ? formatCLP(item.actual_cost) : '—'}
                </span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-muted-foreground">Creada</span>
                <span className="text-muted-foreground">{fmtDate(item.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Formulario de actualización */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              {isSupervisorPlus ? 'Editar solicitud' : 'Actualizar estado'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateWithId} className="space-y-4">
              {/* Supervisor: campos completos */}
              {isSupervisorPlus && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Título</label>
                      <input name="title" defaultValue={item.title}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Categoría</label>
                      <select name="category" defaultValue={item.category}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Urgencia</label>
                      <select name="urgency" defaultValue={item.urgency}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="baja">🟢 Baja</option>
                        <option value="media">🟡 Media</option>
                        <option value="alta">🔴 Alta</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Asignar a</label>
                      <select name="assigned_to" defaultValue={item.assigned_to ?? ''}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Sin asignar</option>
                        {workers.map(w => (
                          <option key={w.id} value={w.id}>{w.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Costo estimado (CLP)</label>
                      <input type="number" name="estimated_cost" min="0"
                        defaultValue={item.estimated_cost ?? ''}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Fecha programada</label>
                      <input type="date" name="scheduled_date"
                        defaultValue={item.scheduled_date ?? ''}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea name="description" rows={2} defaultValue={item.description ?? ''}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  </div>
                </>
              )}

              {/* Todos los que pueden editar */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Estado</label>
                  <select name="status" defaultValue={item.status}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                      <option key={v} value={v}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Costo real (CLP)</label>
                  <input type="number" name="actual_cost" min="0"
                    defaultValue={item.actual_cost ?? ''}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Fecha de completado</label>
                <input type="date" name="completed_date"
                  defaultValue={item.completed_date ?? ''}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notas</label>
                <textarea name="notes" rows={2} defaultValue={item.notes ?? ''}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              <div className="flex justify-end pt-1">
                <button type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                  Guardar cambios
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
