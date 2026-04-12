import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { SimpleCatalog } from '@/components/catalogs/simple-catalog';
import { createCatalogRow, deleteCatalogRow, toggleCatalogRow } from '../actions';
import type { Tables } from '@/lib/types/database.generated';
type VisitType = Tables<'visit_types'>;

export default async function VisitTypesPage() {
  await requireRole('super_admin');
  const supabase = createClient();
  const { data } = await supabase.from('visit_types').select('*').order('sort_order');

  const create = createCatalogRow.bind(null, 'visit_types');
  const toggle = toggleCatalogRow.bind(null, 'visit_types');
  const del = deleteCatalogRow.bind(null, 'visit_types');

  return (
    <SimpleCatalog<VisitType>
      title="Tipos de visita"
      description="Categorías de limpieza / inspección que se registran desde el QR"
      rows={(data as VisitType[]) ?? []}
      createAction={create}
      toggleAction={toggle}
      deleteAction={del}
    />
  );
}
