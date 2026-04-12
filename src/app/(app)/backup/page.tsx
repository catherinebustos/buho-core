import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Download, Database, Building2, CalendarDays, ClipboardList,
  AlertTriangle, Wrench, Receipt, Users, Link2
} from 'lucide-react';

export default async function BackupPage() {
  await requireRole('admin');
  const supabase = createClient();

  // Conteos rápidos para mostrar en la UI
  const [
    { count: propCount },
    { count: occCount },
    { count: visitCount },
    { count: dmgCount },
    { count: maintCount },
    { count: ticketCount },
    { count: profileCount },
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('occupations').select('*', { count: 'exact', head: true }),
    supabase.from('visits').select('*', { count: 'exact', head: true }),
    supabase.from('damage_reports').select('*', { count: 'exact', head: true }),
    supabase.from('maintenance_requests' as any).select('*', { count: 'exact', head: true }),
    supabase.from('purchase_tickets').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ]);

  const sheets = [
    { label: 'Propiedades',    icon: Building2,     count: propCount    ?? 0, sheet: 'Propiedades' },
    { label: 'Ocupaciones',    icon: CalendarDays,   count: occCount     ?? 0, sheet: 'Ocupaciones' },
    { label: 'Visitas',        icon: ClipboardList,  count: visitCount   ?? 0, sheet: 'Visitas' },
    { label: 'Daños',          icon: AlertTriangle,  count: dmgCount     ?? 0, sheet: 'Daños' },
    { label: 'Mantenimiento',  icon: Wrench,         count: maintCount   ?? 0, sheet: 'Mantenimiento' },
    { label: 'Tickets',        icon: Receipt,        count: ticketCount  ?? 0, sheet: 'Tickets + Ítems' },
    { label: 'Personal',       icon: Users,          count: profileCount ?? 0, sheet: 'Personal + Asignaciones' },
  ];

  const today = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-xs text-muted-foreground">Administración</p>
        <h1 className="text-2xl font-bold">Exportar datos</h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      {/* Hero card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Backup completo del portfolio</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Descargá un archivo Excel con todas las tablas del sistema.
              Cada hoja corresponde a un módulo de BúhoOps.
            </p>
          </div>
          <a
            href="/api/export"
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Descargar Excel (.xlsx)
          </a>
          <p className="text-[11px] text-muted-foreground">
            Se genera al momento de la descarga con los datos actuales.
          </p>
        </CardContent>
      </Card>

      {/* Contenido del backup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Contenido del archivo</CardTitle>
          <p className="text-xs text-muted-foreground">
            9 hojas · una por módulo · sin datos sensibles de autenticación
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {sheets.map(({ label, icon: Icon, count, sheet }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                  <Icon className="h-4 w-4 text-zinc-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-[11px] text-muted-foreground">Hoja: {sheet}</p>
                </div>
                <span className="tabular-nums text-sm font-bold text-zinc-700">{count.toLocaleString('es-CL')}</span>
              </div>
            ))}

            {/* Ítem especial para asignaciones */}
            <div className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                <Link2 className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Asignaciones</p>
                <p className="text-[11px] text-muted-foreground">Hoja: Asignaciones</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Cómo trabajar con el Excel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-600">
          <div className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-base">📊</span>
            <p><span className="font-semibold">Múltiples pestañas:</span> Cada módulo tiene su propia hoja. Navegá entre ellas desde la parte inferior del archivo.</p>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-base">🔄</span>
            <p><span className="font-semibold">Datos frescos:</span> Cada descarga refleja el estado actual de la base de datos. Podés guardar versiones con fecha.</p>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-base">🔍</span>
            <p><span className="font-semibold">Filtros de Excel:</span> La primera fila siempre tiene encabezados. Usá Datos → Filtro para explorar por propiedad, fecha o estado.</p>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-base">💾</span>
            <p><span className="font-semibold">Backup periódico:</span> Se recomienda descargar una vez por mes y guardar el archivo con la fecha en el nombre.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
