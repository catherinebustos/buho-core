import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Building2 } from 'lucide-react';
import { PropertyForm } from '@/components/properties/property-form';
import { updateProperty } from '../../actions';
import type { Property, PropertyType } from '@/lib/types/database.generated';

export default async function EditPropertyPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  await requireRole('supervisor');
  const supabase = createClient();

  const [{ data: property }, { data: types }] = await Promise.all([
    supabase.from('properties').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('property_types').select('*').eq('active', true).order('sort_order')
  ]);

  if (!property) notFound();

  const update = updateProperty.bind(null, params.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500 pb-24">
      {/* ── Encabezado Burbuja ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold mb-3 uppercase tracking-widest">
            <Building2 className="w-3.5 h-3.5" />
            {(property as Property).nickname}
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-zinc-900">
            Actualizar Operativa
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Modifica la configuración o metadatos de esta propiedad activa en Búho Core.
          </p>
        </div>
      </div>

      {/* ── Formulario Wrapper ── */}
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
        <h2 className="font-heading text-xl font-bold text-zinc-900 mb-8 pb-4 border-b border-zinc-100">
          Especificaciones Técnicas
        </h2>
        <PropertyForm
          property={property as Property}
          propertyTypes={(types as PropertyType[]) ?? []}
          action={update}
          submitLabel="Guardar Configuraciones"
          cancelHref={`/properties/${params.id}`}
          error={searchParams.error}
        />
      </div>
    </div>
  );
}
