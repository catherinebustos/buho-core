import Link from 'next/link';
import { Building2, QrCode, ClipboardList, AlertTriangle, CalendarCheck } from 'lucide-react';
import { requireProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/ui/empty-state';

export default async function MyPropertiesPage() {
  const profile = await requireProfile();
  const supabase = createClient();

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const { data: assignments } = await supabase
    .from('property_assignments')
    .select('property_id, properties(id, nickname, title, city, status, qr_token)')
    .eq('user_id', profile.id)
    .is('unassigned_at', null);

  const props = (assignments ?? []).map((a: any) => a.properties).filter(Boolean);
  const propIds = props.map((p: any) => p.id);

  let visitCounts: Record<string, number> = {};
  let openDamages: Record<string, number> = {};
  let upcomingOccs: Record<string, any[]> = {};

  if (propIds.length > 0) {
    const [{ data: visits }, { data: damages }, { data: occs }] = await Promise.all([
      supabase
        .from('visits')
        .select('property_id')
        .eq('performed_by', profile.id)
        .gte('visit_at', monthStart)
        .in('property_id', propIds),
      supabase
        .from('damage_reports')
        .select('property_id')
        .in('status', ['pendiente', 'en_proceso'])
        .in('property_id', propIds),
      supabase
        .from('occupations')
        .select('property_id, checkin_date, checkout_date, reservation_code')
        .gte('checkout_date', today)
        .in('property_id', propIds)
        .order('checkin_date')
        .limit(50),
    ]);

    (visits ?? []).forEach((v: any) => {
      visitCounts[v.property_id] = (visitCounts[v.property_id] ?? 0) + 1;
    });
    (damages ?? []).forEach((d: any) => {
      openDamages[d.property_id] = (openDamages[d.property_id] ?? 0) + 1;
    });
    (occs ?? []).forEach((o: any) => {
      if (!upcomingOccs[o.property_id]) upcomingOccs[o.property_id] = [];
      if (upcomingOccs[o.property_id].length < 2) upcomingOccs[o.property_id].push(o);
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <div>
        <p className="text-xs text-muted-foreground">Mi espacio</p>
        <h1 className="text-2xl font-bold">Mis Propiedades</h1>
        <p className="text-sm text-muted-foreground">
          {props.length} propiedad{props.length !== 1 ? 'es' : ''} asignada{props.length !== 1 ? 's' : ''}
        </p>
      </div>

      {props.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-10 w-10 text-zinc-300" />}
          title="Sin propiedades asignadas"
          description="Contacta a tu supervisor para que te asigne propiedades."
        />
      ) : (
        <div className="grid gap-4">
          {props.map((p: any) => {
            const vc = visitCounts[p.id] ?? 0;
            const dc = openDamages[p.id] ?? 0;
            const occs = upcomingOccs[p.id] ?? [];

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-zinc-900">{p.nickname}</h2>
                    <p className="text-sm text-zinc-400 truncate">{p.title} · {p.city}</p>
                  </div>
                  <Link
                    href={`/visits/new?property=${p.id}&qr=1`}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                    <span className="hidden sm:inline">Registrar visita</span>
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 border-t border-zinc-50 divide-x divide-zinc-50">
                  <div className="flex items-center gap-2 px-4 py-3">
                    <ClipboardList className="h-4 w-4 text-zinc-300" />
                    <span className="text-sm font-bold text-zinc-700">{vc}</span>
                    <span className="text-xs text-zinc-400">visitas</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3">
                    <AlertTriangle className="h-4 w-4 text-zinc-300" />
                    <span className={`text-sm font-bold ${dc > 0 ? 'text-red-600' : 'text-zinc-700'}`}>{dc}</span>
                    <span className="text-xs text-zinc-400">daños</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-3">
                    <CalendarCheck className="h-4 w-4 text-zinc-300" />
                    <span className="text-sm font-bold text-zinc-700">{occs.length}</span>
                    <span className="text-xs text-zinc-400">próximas</span>
                  </div>
                </div>

                {/* Upcoming occupations */}
                {occs.length > 0 && (
                  <div className="border-t border-zinc-50 px-5 py-3 space-y-1.5">
                    {occs.map((o: any) => (
                      <div key={o.reservation_code} className="flex items-center gap-2 text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                        <span className="font-medium text-zinc-600">
                          {new Date(o.checkin_date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                          {' → '}
                          {new Date(o.checkout_date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-zinc-400">{o.reservation_code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
