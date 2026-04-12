import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { SimpleCatalog } from '@/components/catalogs/simple-catalog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCatalogRow, deleteCatalogRow, toggleCatalogRow } from '../actions';
import type { Supplier } from '@/lib/types/database.generated';

export default async function SuppliersPage() {
  await requireRole('super_admin');
  const supabase = createClient();
  const { data } = await supabase.from('suppliers').select('*').order('name');

  const create = createCatalogRow.bind(null, 'suppliers');
  const toggle = toggleCatalogRow.bind(null, 'suppliers');
  const del = deleteCatalogRow.bind(null, 'suppliers');

  return (
    <SimpleCatalog<Supplier>
      title="Proveedores"
      description="Tiendas donde se realizan las compras"
      rows={(data as Supplier[]) ?? []}
      createAction={create}
      toggleAction={toggle}
      deleteAction={del}
      extraColumns={[{ key: 'notes', label: 'Notas' }]}
      renderExtraCells={(row) => (
        <td className="p-3 align-middle text-sm text-muted-foreground">{row.notes ?? '—'}</td>
      )}
    >
      <div className="min-w-48 flex-1 space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Input id="notes" name="notes" />
      </div>
    </SimpleCatalog>
  );
}
