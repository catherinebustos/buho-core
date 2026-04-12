import Link from 'next/link';
import { ClipboardList, AlertTriangle, Building2, QrCode, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';

interface Props {
  profile: Profile;
}

export async function CleanerDashboard({ profile }: Props) {
  const supabase = createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { data: assignments },
    { count: visitsThisMonth },
    { count: openDamages },
    { data: recentVisits },
  ] = await Promise.all([
    supabase
      .from('property_assignments')
      .select('property_id, properties(id, nickname, title, qr_token, status)')
      .eq('user_id', profile.id)
      .is('unassigned_at', null),
    supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('performed_by', profile.id)
      .gte('visit_at', monthStart),
    supabase
      .from('damage_reports')
      .select('*', { count: 'exact', head: true })
      .eq('reported_by', profile.id)
      .in('status', ['pendiente', 'en_proceso']),
    supabase
      .from('visits')
      .select('id, visit_at, via_qr, properties(nickname), visit_types(name)')
      .eq('performed_by', profile.id)
      .order('visit_at', { ascending: false })
      .limit(5),
  ]);

  const props = (assignments ?? []).map((a: any) => a.properties).filter(Boolean);
  const firstName = profile.full_name.split(' ')[0];

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Greeting */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
        <h1 className="text-3xl font-black font-heading text-zinc-900">
          Hola, <span className="text-primary">{firstName}</span>
        </h1>
        <p className="mt-1 text-sm font-medium text-zinc-400">
          {now.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 text-center">
          <p className="text-3xl font-black font-heading text-zinc-900">{visitsThisMonth ?? 0}</p>
          <p className="mt-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Limpiezas este mes</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 text-center">
          <p className="text-3xl font-black font-heading text-zinc-900">{props.length}</p>
          <p className="mt-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Propiedades</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 text-center">
          <p className="text-3xl font-black font-heading text-primary">{openDamages ?? 0}</p>
          <p className="mt-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Daños abiertos</p>
        </div>
      </div>

      {/* Assigned Properties */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black font-heading text-zinc-900">Mis Propiedades</h2>
          <Link href="/my-properties" className="text-xs font-bold text-primary flex items-center gap-1">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {props.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center">
            <Building2 className="h-8 w-8 text-zinc-200 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-400">Sin propiedades asignadas</p>
            <p className="text-xs text-zinc-300">Contacta a tu supervisor.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {props.map((p: any) => (
              <div key={p.id} className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-zinc-900 truncate">{p.nickname}</p>
                  <p className="text-xs text-zinc-400 truncate">{p.title}</p>
                </div>
                <Link
                  href={`/visits/new?property=${p.id}&qr=1`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                  title="Registrar visita"
                >
                  <QrCode className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/visits/new"
          className="flex items-center gap-3 bg-white rounded-2xl border border-primary/20 bg-primary/5 p-4 hover:border-primary/40 hover:shadow-md transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">Nuevo Check-list</p>
            <p className="text-[11px] text-zinc-500">Registrar limpieza</p>
          </div>
        </Link>
        <Link
          href="/damages"
          className="flex items-center gap-3 bg-white rounded-2xl border border-zinc-100 p-4 hover:border-primary/20 hover:shadow-md transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">Reportar Daño</p>
            <p className="text-[11px] text-zinc-400">Nuevo reporte</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      {(recentVisits ?? []).length > 0 && (
        <section>
          <h2 className="text-lg font-black font-heading text-zinc-900 mb-3">Check-lists completados</h2>
          <div className="bg-white rounded-2xl border border-zinc-100 divide-y divide-zinc-50">
            {(recentVisits ?? []).map((v: any) => (
              <div key={v.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50">
                  <ClipboardList className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {(v.properties as any)?.nickname} — {(v.visit_types as any)?.name}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    {new Date(v.visit_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {v.via_qr && ' · vía QR'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
