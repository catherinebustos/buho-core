import Link from 'next/link';
import { AlertTriangle, Wrench, Calendar, User, Info } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterSelect } from '@/components/ui/filter-select';
import { formatDateTime } from '@/lib/utils';
import type { DamageStatus, DamageUrgency } from '@/lib/types/database.generated';

const URGENCY_LABEL: Record<DamageUrgency, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta'
};

const STATUS_LABEL: Record<DamageStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
  descartado: 'Descartado'
};

const STATUS_COLORS: Record<DamageStatus, string> = {
  pendiente: 'bg-orange-100 text-orange-700',
  en_proceso: 'bg-blue-100 text-blue-700',
  resuelto: 'bg-green-100 text-green-700',
  descartado: 'bg-zinc-100 text-zinc-600'
};

const URGENCY_COLORS: Record<DamageUrgency, string> = {
  baja: 'bg-zinc-100 text-zinc-600',
  media: 'bg-amber-100 text-amber-700',
  alta: 'bg-red-100 text-red-700'
};

export default async function DamagesListPage({
  searchParams
}: {
  searchParams: { status?: string; urgency?: string };
}) {
  await requireRole('cleaner');
  const supabase = createClient();

  let query = supabase
    .from('damage_reports')
    .select(
      'id, description, urgency, status, reported_at, properties(nickname), profiles(full_name)'
    )
    .order('reported_at', { ascending: false })
    .limit(200);

  if (searchParams.status) query = query.eq('status', searchParams.status);
  if (searchParams.urgency) query = query.eq('urgency', searchParams.urgency);

  const { data } = await query;
  const rows = (data ?? []) as any[];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* ── Encabezado ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold mb-3 uppercase tracking-widest">
            <Wrench className="w-3.5 h-3.5" />
            Support / Daños
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-zinc-900">
            Daños reportados
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Seguimiento de incidencias reportadas por el equipo durante visitas.
          </p>
        </div>
      </div>

      {/* ── Barra de Filtros (Burbuja) ── */}
      <form className="flex flex-col lg:flex-row items-center gap-3 bg-zinc-50/50 p-2 rounded-3xl border border-zinc-100">
        <div className="flex w-full lg:w-auto gap-3 flex-1 lg:flex-none">
          <FilterSelect
            name="status"
            defaultValue={searchParams.status ?? ''}
            placeholder="Todos los estados"
            options={[
              { label: 'Todos los estados', value: '' },
              { label: 'Pendiente', value: 'pendiente' },
              { label: 'En proceso', value: 'en_proceso' },
              { label: 'Resuelto', value: 'resuelto' },
              { label: 'Descartado', value: 'descartado' }
            ]}
          />

          <FilterSelect
            name="urgency"
            defaultValue={searchParams.urgency ?? ''}
            placeholder="Todas las urgencias"
            options={[
              { label: 'Todas las urgencias', value: '' },
              { label: 'Baja', value: 'baja' },
              { label: 'Media', value: 'media' },
              { label: 'Alta', value: 'alta' }
            ]}
          />
        </div>
        <div className="hidden lg:block flex-1"></div>
        <Button
          type="submit"
          className="w-full lg:w-auto h-14 px-8 rounded-2xl font-bold bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 shadow-sm transition-all whitespace-nowrap"
        >
          Filtrar Resultados
        </Button>
      </form>

      {/* ── Grilla de Daños ── */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-12">
          <EmptyState
            icon={<AlertTriangle className="h-12 w-12 text-zinc-300" />}
            title="Sin daños reportados"
            description="Cuando el equipo reporte incidencias en una visita aparecerán acá para su gestión."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {rows.map((d) => (
            <Link key={d.id} href={`/damages/${d.id}`} className="group block outline-none">
              <div className="flex flex-col bg-white p-6 rounded-3xl border border-zinc-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-primary/20 transition-all duration-300 relative overflow-hidden focus-visible:ring-2 focus-visible:ring-primary h-full">
                
                {/* Status Indicator */}
                <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${d.status === 'resuelto' ? 'bg-green-500' : d.status === 'pendiente' ? 'bg-orange-500' : 'bg-blue-500'}`} />

                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-zinc-100 text-zinc-900 font-mono text-xs font-bold uppercase tracking-wider group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {d.properties?.nickname ?? '—'}
                  </span>
                  <div className="flex gap-2">
                    <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-md ${URGENCY_COLORS[d.urgency as DamageUrgency]}`}>
                      {URGENCY_LABEL[d.urgency as DamageUrgency]}
                    </span>
                    <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-md ${STATUS_COLORS[d.status as DamageStatus]}`}>
                      {STATUS_LABEL[d.status as DamageStatus]}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-2 mb-6">
                  <Info className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                  <p className="text-zinc-600 font-medium text-sm line-clamp-3">
                    {d.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-zinc-100">
                  <div className="flex flex-col justify-center bg-zinc-50 rounded-xl p-3 gap-1 text-zinc-600">
                    <div className="flex items-center gap-1.5 opacity-70">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Fecha reporte</span>
                    </div>
                    <span className="text-xs font-bold">{formatDateTime(d.reported_at)}</span>
                  </div>
                  <div className="flex flex-col justify-center bg-zinc-50 rounded-xl p-3 gap-1 text-zinc-600">
                    <div className="flex items-center gap-1.5 opacity-70">
                      <User className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Reportado por</span>
                    </div>
                    <span className="text-xs font-bold truncate">{d.profiles?.full_name ?? '—'}</span>
                  </div>
                </div>
                
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
