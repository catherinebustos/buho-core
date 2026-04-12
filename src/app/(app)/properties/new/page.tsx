import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Building2 } from 'lucide-react';
import { PropertyForm } from '@/components/properties/property-form';
import { createProperty } from '../actions';
import type { PropertyType } from '@/lib/types/database.generated';

export default async function NewPropertyPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  await requireRole('supervisor');
  const supabase = createClient();
  const { data: types } = await supabase
    .from('property_types')
    .select('*')
    .eq('active', true)
    .order('sort_order');

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500 pb-24">
      {/* ── Encabezado Burbuja ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 uppercase tracking-widest">
            <Building2 className="w-3.5 h-3.5" />
            Ingreso al Inventario
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-zinc-900">
            Nueva Propiedad
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Da de alta una nueva unidad en el sistema principal operativo Búho Core.
          </p>
        </div>
      </div>

      {/* ── Formulario Wrapper ── */}
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
        <h2 className="font-heading text-xl font-bold text-zinc-900 mb-8 pb-4 border-b border-zinc-100">
          Especificaciones Técnicas
        </h2>
        <PropertyForm
          propertyTypes={(types as PropertyType[]) ?? []}
          action={createProperty}
          submitLabel="Registrar Propiedad"
          cancelHref="/properties"
          error={searchParams.error}
        />
      </div>
    </div>
  );
}
