import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { SimpleCatalog } from '@/components/catalogs/simple-catalog';
import { createCatalogRow, deleteCatalogRow, toggleCatalogRow } from '../actions';
import type { PropertyType } from '@/lib/types/database.generated';

export default async function PropertyTypesPage() {
  await requireRole('super_admin');
  const supabase = createClient();
  const { data } = await supabase.from('property_types').select('*').order('sort_order');

  const create = createCatalogRow.bind(null, 'property_types');
  const toggle = toggleCatalogRow.bind(null, 'property_types');
  const del = deleteCatalogRow.bind(null, 'property_types');

  return (
    <SimpleCatalog<PropertyType>
      title="Tipos de propiedad"
      description="Studio, 1D1B, Casa, Cabaña, etc."
      rows={(data as PropertyType[]) ?? []}
      createAction={create}
      toggleAction={toggle}
      deleteAction={del}
    />
  );
}
