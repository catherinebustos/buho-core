import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { SimpleCatalog } from '@/components/catalogs/simple-catalog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { createCatalogRow, deleteCatalogRow, toggleCatalogRow } from '../actions';
import type { Tables } from '@/lib/types/database.generated';
type ItemCategory = Tables<'item_categories'>;

export default async function ItemCategoriesPage() {
  await requireRole('super_admin');
  const supabase = createClient();
  const { data } = await supabase
    .from('item_categories')
    .select('*')
    .order('kind')
    .order('sort_order');

  const create = createCatalogRow.bind(null, 'item_categories');
  const toggle = toggleCatalogRow.bind(null, 'item_categories');
  const del = deleteCatalogRow.bind(null, 'item_categories');

  return (
    <SimpleCatalog<ItemCategory>
      title="Categorías de ítems"
      description="Agrupaciones de consumibles y esporádicos"
      rows={(data as ItemCategory[]) ?? []}
      createAction={create}
      toggleAction={toggle}
      deleteAction={del}
      extraColumns={[{ key: 'kind', label: 'Tipo' }]}
      renderExtraCells={(row) => (
        <td className="p-3 align-middle">
          <Badge variant={row.kind === 'consumible' ? 'default' : 'secondary'}>{row.kind}</Badge>
        </td>
      )}
    >
      <div className="min-w-48 space-y-2">
        <Label htmlFor="kind">Tipo</Label>
        <Select id="kind" name="kind" defaultValue="consumible">
          <option value="consumible">Consumible</option>
          <option value="esporadico">Esporádico</option>
        </Select>
      </div>
    </SimpleCatalog>
  );
}
