import Link from 'next/link';
import { Building2, Plus, Search, MapPin, Users, Maximize, CircleDashed } from 'lucide-react';
import { requireProfile, hasRoleAtLeast } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterSelect } from '@/components/ui/filter-select';

interface PropertyRow {
  id: string;
  nickname: string;
  title: string;
  city: string;
  status: 'activa' | 'inactiva';
  area_m2: number | null;
  guest_capacity: number | null;
  property_types: { name: string } | null;
}

export default async function PropertiesListPage({
  searchParams
}: {
  searchParams: { q?: string; city?: string; status?: string };
}) {
  const profile = await requireProfile();
  const canCreate = hasRoleAtLeast(profile.role, 'supervisor');
  const supabase = createClient();

  let query = supabase
    .from('properties')
    .select('id, nickname, title, city, status, area_m2, guest_capacity, property_types(name)')
    .order('nickname');

  if (searchParams.q) {
    query = query.or(`nickname.ilike.%${searchParams.q}%,title.ilike.%${searchParams.q}%`);
  }
  if (searchParams.city) query = query.eq('city', searchParams.city);
  if (searchParams.status) query = query.eq('status', searchParams.status);

  const { data } = await query;
  const rows = (data ?? []) as unknown as PropertyRow[];

  const { data: cities } = await supabase
    .from('properties')
    .select('city')
    .order('city');
  const uniqueCities = Array.from(new Set((cities ?? []).map((c) => c.city))).filter(Boolean);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* ── Encabezado ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold mb-3 uppercase tracking-widest">
            <Building2 className="w-3.5 h-3.5" />
            Inventory Búho Core
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-zinc-900">
            Propiedades
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Gestión centralizada del portafolio inmobiliario.
          </p>
        </div>
        {canCreate && (
          <Link href="/properties/new">
            <Button className="h-12 px-6 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-primary hover:-translate-y-1 transition-all shadow-lg hover:shadow-primary/25">
              <Plus className="mr-2 h-5 w-5" />
              New Property
            </Button>
          </Link>
        )}
      </div>

      {/* ── Barra de Filtros (Burbuja) ── */}
      <form className="flex flex-col lg:flex-row items-center gap-3 bg-zinc-50/50 p-2 rounded-3xl border border-zinc-100">
        <div className="relative w-full flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Buscar por nickname o título..."
            className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
          />
        </div>
        
        <div className="flex w-full lg:w-auto gap-3">
          <FilterSelect
            name="city"
            defaultValue={searchParams.city ?? ''}
            placeholder="Todas las ciudades"
            options={[
              { label: 'Todas las ciudades', value: '' },
              ...uniqueCities.map(c => ({ label: c, value: c }))
            ]}
          />

          <FilterSelect
            name="status"
            defaultValue={searchParams.status ?? ''}
            placeholder="Todos los estados"
            options={[
              { label: 'Todos los estados', value: '' },
              { label: 'Activa', value: 'activa' },
              { label: 'Inactiva', value: 'inactiva' }
            ]}
          />
          
          <Button type="submit" className="h-14 px-8 rounded-2xl font-bold bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 shadow-sm transition-all whitespace-nowrap">
            Filtrar
          </Button>
        </div>
      </form>

      {/* ── Grilla de Propiedades (Tarjetas en lugar de tabla aburrida) ── */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-12">
          <EmptyState
            icon={<Building2 className="h-12 w-12 text-zinc-300" />}
            title="Inventario Vacío"
            description={
              canCreate
                ? 'No hemos encontrado propiedades. Configura la primera para iniciar la operativa.'
                : 'No tienes acceso a propiedades en este momento.'
            }
            action={
              canCreate ? (
                <Link href="/properties/new">
                  <Button className="mt-4 rounded-xl font-bold">Crear Propiedad</Button>
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {rows.map((p) => (
            <Link key={p.id} href={`/properties/${p.id}`} className="group block outline-none">
              <div className="flex flex-col bg-white p-6 rounded-3xl border border-zinc-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-primary/20 transition-all duration-300 relative overflow-hidden focus-visible:ring-2 focus-visible:ring-primary">
                
                {/* Status Indicator */}
                <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${p.status === 'activa' ? 'bg-green-500' : 'bg-zinc-300'}`} />

                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-zinc-100 text-zinc-900 font-mono text-xs font-bold uppercase tracking-wider group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {p.nickname}
                  </span>
                  <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-md ${
                     p.status === 'activa' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <h3 className="font-heading text-xl font-black text-zinc-900 mb-1 leading-tight line-clamp-2">
                  {p.title}
                </h3>
                <p className="text-zinc-500 font-medium text-sm mb-6">
                  {p.property_types?.name ?? 'Tipo no definido'}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-zinc-100">
                  <div className="flex flex-col items-center justify-center bg-zinc-50 rounded-xl p-2 gap-1 text-zinc-600">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-bold">{p.city}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-zinc-50 rounded-xl p-2 gap-1 text-zinc-600">
                    <Maximize className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-bold">{p.area_m2 ?? '—'} m²</span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-zinc-50 rounded-xl p-2 gap-1 text-zinc-600">
                    <Users className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-bold">{p.guest_capacity ?? '—'} pax</span>
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
