import Link from 'next/link';
import {
  Building2, ClipboardList, AlertTriangle, CalendarCheck,
  Wrench, Receipt, ArrowRight, Plus
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';
import { ROLE_LABELS } from '@/lib/constants';

interface Props {
  profile: Profile;
}

export async function SupervisorDashboard({ profile }: Props) {
  const supabase = createClient();

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: activeProps },
    { count: visitsThisMonth },
    { count: openDamages },
    { count: pendingMaint },
    { data: todayCheckins },
    { data: todayCheckouts },
    { data: recentDamages },
    { data: recentVisits },
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'activa'),
    supabase.from('visits').select('*', { count: 'exact', head: true }).gte('visit_at', monthStart),
    supabase.from('damage_reports').select('*', { count: 'exact', head: true }).in('status', ['pendiente', 'en_proceso']),
    supabase.from('maintenance_requests' as any).select('*', { count: 'exact', head: true }).in('status', ['pendiente', 'presupuestado', 'aprobado']),
    supabase.from('occupations').select('id, reservation_code, properties(nickname)').eq('checkin_date', today).limit(5),
    supabase.from('occupations').select('id, reservation_code, properties(nickname)').eq('checkout_date', today).limit(5),
    supabase.from('damage_reports').select('id, description, urgency, status, properties(nickname)').in('status', ['pendiente', 'en_proceso']).order('reported_at', { ascending: false }).limit(5),
    supabase.from('visits').select('id, visit_at, properties(nickname), visit_types(name), profiles(full_name)').order('visit_at', { ascending: false }).limit(5),
  ]);

  const firstName = profile.full_name.split(' ')[0];

  const urgencyDot: Record<string, string> = { alta: 'bg-red-500', media: 'bg-yellow-500', baja: 'bg-green-500' };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black font-heading text-zinc-900">
            Hola, <span className="text-primary">{firstName}</span>
          </h1>
          <div className="mt-1 flex flex-col gap-0.5">
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              La operación · {ROLE_LABELS[profile.role]}
            </p>
            <p className="text-sm font-medium text-zinc-500 capitalize">
              {now.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Propiedades', value: activeProps ?? 0, icon: Building2, color: 'bg-blue-50 text-blue-600' },
          { label: 'Visitas (mes)', value: visitsThisMonth ?? 0, icon: ClipboardList, color: 'bg-green-50 text-green-600' },
          { label: 'Daños abiertos', value: openDamages ?? 0, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
          { label: 'Mant. pendiente', value: pendingMaint ?? 0, icon: Wrench, color: 'bg-orange-50 text-orange-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-zinc-100 p-5 flex items-center gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black font-heading text-zinc-900">{kpi.value}</p>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's movements */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Check-ins */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-green-500" /> Check-ins hoy
            </h2>
            <span className="text-xs font-bold text-zinc-400">{(todayCheckins ?? []).length}</span>
          </div>
          {(todayCheckins ?? []).length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">Sin check-ins hoy</p>
          ) : (
            <div className="space-y-2">
              {(todayCheckins ?? []).map((o: any) => (
                <Link key={o.id} href={`/occupations/${o.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-zinc-50 transition-colors">
                  <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                  <span className="text-sm font-medium text-zinc-700 truncate">{(o.properties as any)?.nickname}</span>
                  <span className="text-xs text-zinc-400 ml-auto">{o.reservation_code}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Check-outs */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-orange-500" /> Check-outs hoy
            </h2>
            <span className="text-xs font-bold text-zinc-400">{(todayCheckouts ?? []).length}</span>
          </div>
          {(todayCheckouts ?? []).length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">Sin check-outs hoy</p>
          ) : (
            <div className="space-y-2">
              {(todayCheckouts ?? []).map((o: any) => (
                <Link key={o.id} href={`/occupations/${o.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-zinc-50 transition-colors">
                  <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                  <span className="text-sm font-medium text-zinc-700 truncate">{(o.properties as any)?.nickname}</span>
                  <span className="text-xs text-zinc-400 ml-auto">{o.reservation_code}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: '/visits/new', label: 'Nueva visita', icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
          { href: '/damages/new', label: 'Reportar daño', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { href: '/maintenance/new', label: 'Nuevo mant.', icon: Wrench, color: 'text-orange-600 bg-orange-50' },
          { href: '/occupations/new', label: 'Nueva ocupación', icon: CalendarCheck, color: 'text-green-600 bg-green-50' },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="flex items-center gap-3 bg-white rounded-2xl border border-zinc-100 p-4 hover:border-primary/20 hover:shadow-md transition-all">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${a.color}`}>
              <a.icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-zinc-900">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent damages + visits */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-zinc-900">Daños abiertos</h2>
            <Link href="/damages" className="text-xs font-bold text-primary flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {(recentDamages ?? []).length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">Sin daños abiertos</p>
          ) : (
            <div className="space-y-2">
              {(recentDamages ?? []).map((d: any) => (
                <Link key={d.id} href={`/damages/${d.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-zinc-50 transition-colors">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${urgencyDot[d.urgency] ?? 'bg-zinc-300'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-700 truncate">{d.description}</p>
                    <p className="text-[11px] text-zinc-400">{(d.properties as any)?.nickname}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-zinc-900">Últimas visitas</h2>
            <Link href="/visits" className="text-xs font-bold text-primary flex items-center gap-1">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {(recentVisits ?? []).length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">Sin visitas recientes</p>
          ) : (
            <div className="space-y-2">
              {(recentVisits ?? []).map((v: any) => (
                <div key={v.id} className="flex items-center gap-3 rounded-xl p-2">
                  <ClipboardList className="h-4 w-4 text-zinc-300 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-700 truncate">
                      {(v.properties as any)?.nickname} — {(v.visit_types as any)?.name}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {(v.profiles as any)?.full_name} · {new Date(v.visit_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
