import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createMaintenanceRequest } from '../actions';
import { CATEGORY_LABELS } from '../page';

export default async function NewMaintenancePage() {
  await requireRole('supervisor');
  const supabase = createClient();

  const [{ data: properties }, { data: staff }] = await Promise.all([
    supabase.from('properties').select('id, nickname').eq('status', 'activa').order('nickname'),
    supabase.from('profiles').select('id, full_name, role').eq('active', true)
      .in('role', ['maintenance', 'supervisor', 'admin', 'super_admin']).order('full_name'),
  ]);

  const props = (properties ?? []) as any[];
  const workers = (staff ?? []) as any[];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/maintenance" />
      </div>

      <div>
        <p className="text-xs text-muted-foreground">Mantenimiento</p>
        <h1 className="text-2xl font-bold">Nueva solicitud</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalle de la solicitud</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createMaintenanceRequest} className="space-y-5">
            {/* Propiedad */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Propiedad *</label>
              <select name="property_id" required
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Seleccionar propiedad…</option>
                {props.map(p => (
                  <option key={p.id} value={p.id}>{p.nickname}</option>
                ))}
              </select>
            </div>

            {/* Título */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Título *</label>
              <input name="title" required placeholder="Ej: Cambio de llave de paso baño"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Descripción</label>
              <textarea name="description" rows={3} placeholder="Detalles adicionales…"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>

            {/* Categoría + Urgencia */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Categoría *</label>
                <select name="category" required
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Seleccionar…</option>
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Urgencia *</label>
                <select name="urgency" defaultValue="media"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="baja">🟢 Baja</option>
                  <option value="media">🟡 Media</option>
                  <option value="alta">🔴 Alta</option>
                </select>
              </div>
            </div>

            {/* Asignado + Fecha programada */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Asignar a</label>
                <select name="assigned_to"
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Sin asignar</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Fecha programada</label>
                <input type="date" name="scheduled_date"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            {/* Costo estimado */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Costo estimado (CLP)</label>
              <input type="number" name="estimated_cost" min="0" placeholder="0"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notas internas</label>
              <textarea name="notes" rows={2} placeholder="Instrucciones, acceso, contacto…"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <BackButton href="/maintenance" />
              <button type="submit"
                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors">
                Crear solicitud
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
