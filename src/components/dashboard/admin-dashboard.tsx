import Link from 'next/link';
import {
  Building2, ClipboardList, AlertTriangle, Users, Wrench,
  Receipt, TrendingUp, DollarSign, ArrowRight, BarChart3
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';
import { ROLE_LABELS } from '@/lib/constants';

interface Props {
  profile: Profile;
}

export async function AdminDashboard({ profile }: Props) {
  const supabase = createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const [
    { count: activeProps },
    { count: totalStaff },
    { count: visitsThisMonth },
    { count: visitsPrevMonth },
    { count: openDamages },
    { count: pendingMaint },
    { data: ticketsThisMonth },
    { data: recentMaint },
    { data: staffByRole },
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'activa'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('visits').select('*', { count: 'exact', head: true }).gte('visit_at', monthStart),
    supabase.from('visits').select('*', { count: 'exact', head: true }).gte('visit_at', prevMonthStart).lte('visit_at', prevMonthEnd),
    supabase.from('damage_reports').select('*', { count: 'exact', head: true }).in('status', ['pendiente', 'en_proceso']),
    supabase.from('maintenance_requests' as any).select('*', { count: 'exact', head: true }).in('status', ['pendiente', 'presupuestado', 'aprobado', 'en_proceso']),
    supabase.from('purchase_tickets').select('total').gte('purchase_date', monthStart.slice(0, 10)),
    supabase.from('maintenance_requests' as any).select('id, title, status, urgency, actual_cost, properties(nickname)').in('status', ['en_proceso', 'pendiente']).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('role').eq('active', true),
  ]);

  const firstName = profile.full_name.split(' ')[0];
  const totalSpent = (ticketsThisMonth ?? []).reduce((sum: number, t: any) => sum + (t.total ?? 0), 0);

  const visitsTrend = (visitsPrevMonth ?? 0) > 0
    ? Math.round(((visitsThisMonth ?? 0) - (visitsPrevMonth ?? 0)) / (visitsPrevMonth ?? 1) * 100)
    : 0;

  const roleCounts: Record<string, number> = {};
  (staffByRole ?? []).forEach((p: any) => {
    roleCounts[p.role] = (roleCounts[p.role] ?? 0) + 1;
  });

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
              El negocio · {ROLE_LABELS[profile.role]}
            </p>
            <p className="text-sm font-medium text-zinc-500 capitalize">
              {now.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <Link href="/reports" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
          <BarChart3 className="h-4 w-4" /> Ver reportes completos
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase">Portfolio</p>
          </div>
          <p className="text-3xl font-black font-heading text-zinc-900">{activeProps ?? 0}</p>
          <p className="text-xs text-zinc-400 mt-1">propiedades activas</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase">Operaciones</p>
          </div>
          <p className="text-3xl font-black font-heading text-zinc-900">{visitsThisMonth ?? 0}</p>
          <div className="flex items-center gap-1 mt-1">
            {visitsTrend !== 0 && (
              <span className={`text-xs font-bold ${visitsTrend > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {visitsTrend > 0 ? '+' : ''}{visitsTrend}%
              </span>
            )}
            <p className="text-xs text-zinc-400">visitas este mes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase">Gasto (mes)</p>
          </div>
          <p className="text-3xl font-black font-heading text-zinc-900">
            ${totalSpent.toLocaleString('es-CL')}
          </p>
          <p className="text-xs text-zinc-400 mt-1">en tickets de compra</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase">Equipo</p>
          </div>
          <p className="text-3xl font-black font-heading text-zinc-900">{totalStaff ?? 0}</p>
          <p className="text-xs text-zinc-400 mt-1">personal activo</p>
        </div>
      </div>

      {/* Alerts row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-2xl border border-red-100 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black font-heading text-red-700">{openDamages ?? 0}</p>
            <p className="text-xs font-bold text-red-500 uppercase">Daños sin resolver</p>
          </div>
          <Link href="/damages" className="ml-auto text-xs font-bold text-red-600 flex items-center gap-1">
            Ver <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black font-heading text-orange-700">{pendingMaint ?? 0}</p>
            <p className="text-xs font-bold text-orange-500 uppercase">Mant. en curso</p>
          </div>
          <Link href="/maintenance" className="ml-auto text-xs font-bold text-orange-600 flex items-center gap-1">
            Ver <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Bottom: Maintenance + Team */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active maintenance */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-zinc-900">Mantenimientos activos</h2>
            <Link href="/maintenance" className="text-xs font-bold text-primary flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {(recentMaint ?? []).length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">Sin mantenimientos activos</p>
          ) : (
            <div className="space-y-2">
              {(recentMaint ?? []).map((m: any) => (
                <Link key={m.id} href={`/maintenance/${m.id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-zinc-50 transition-colors">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${urgencyDot[m.urgency] ?? 'bg-zinc-300'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-700 truncate">{m.title}</p>
                    <p className="text-[11px] text-zinc-400">{(m.properties as any)?.nickname}</p>
                  </div>
                  {m.actual_cost && (
                    <span className="text-xs font-bold text-zinc-500">${Number(m.actual_cost).toLocaleString('es-CL')}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Team composition */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-zinc-900">Composición del equipo</h2>
            <Link href="/users" className="text-xs font-bold text-primary flex items-center gap-1">
              Gestionar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {(['supervisor', 'maintenance', 'cleaner'] as const).map((r) => {
              const count = roleCounts[r] ?? 0;
              const total = totalStaff ?? 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={r}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-zinc-700">{ROLE_LABELS[r]}</span>
                    <span className="text-xs font-bold text-zinc-500">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
