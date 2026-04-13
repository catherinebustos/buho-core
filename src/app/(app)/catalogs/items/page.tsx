import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { SimpleCatalog } from '@/components/catalogs/simple-catalog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { createCatalogRow, deleteCatalogRow, toggleCatalogRow } from '../actions';
import type { Tables } from '@/lib/types/database.generated';
type Item = Tables<'items'>;
type ItemCategory = Tables<'item_categories'>;

type ItemWithCategory = Item & {
  item_categories: Pick<ItemCategory, 'name' | 'kind'> | null;
  units_per_package?: number;
};

export default async function ItemsPage() {
  await requireRole('super_admin');
  const supabase = createClient();

  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from('items')
      .select('*, item_categories(name, kind)')
      .order('name'),
    supabase.from('item_categories').select('*').eq('active', true).order('sort_order')
  ]);

  const rows = (items as unknown as ItemWithCategory[]) ?? [];
  const cats = (categories as ItemCategory[]) ?? [];

  const create = createCatalogRow.bind(null, 'items');
  const toggle = toggleCatalogRow.bind(null, 'items');
  const del = deleteCatalogRow.bind(null, 'items');

  return (
    <SimpleCatalog<ItemWithCategory>
      title="Ítems"
      description="Consumibles y elementos esporádicos usados en las propiedades"
      rows={rows}
      createAction={create}
      toggleAction={toggle}
      deleteAction={del}
      extraColumns={[
        { key: 'category', label: 'Categoría' },
        { key: 'unit', label: 'Unidad' },
        { key: 'units_per_package', label: 'Contenido/unidad' }
      ]}
      renderExtraCells={(row) => (
        <>
          <td className="p-3 align-middle text-sm">
            {row.item_categories?.name ?? '—'}{' '}
            <span className="text-xs text-muted-foreground">({row.item_categories?.kind})</span>
          </td>
          <td className="p-3 align-middle text-sm text-muted-foreground">{row.unit}</td>
          <td className="p-3 align-middle text-sm tabular-nums">
            {(row as any).units_per_package && (row as any).units_per_package > 1 ? (
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {(row as any).units_per_package} {row.unit}/unidad
              </span>
            ) : (
              <span className="text-muted-foreground">1 (sin desglose)</span>
            )}
          </td>
        </>
      )}
    >
      <div className="min-w-48 space-y-2">
        <Label htmlFor="category_id">Categoría</Label>
        <Select id="category_id" name="category_id" required>
          <option value="">— Selecciona —</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.kind})
            </option>
          ))}
        </Select>
      </div>
      <div className="w-32 space-y-2">
        <Label htmlFor="unit">Unidad</Label>
        <Input id="unit" name="unit" defaultValue="unidad" />
      </div>
      <div className="w-40 space-y-2">
        <Label htmlFor="units_per_package">Contenido/unidad</Label>
        <Input
          id="units_per_package"
          name="units_per_package"
          type="number"
          min="1"
          step="1"
          defaultValue="1"
          title="Cuántas unidades individuales contiene cada unidad comprada (ej: 40 rollos por paquete)"
        />
        <p className="text-xs text-muted-foreground">Ej: 40 rollos por paquete</p>
      </div>
    </SimpleCatalog>
  );
}
