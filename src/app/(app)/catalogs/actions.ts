'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type SimpleCatalogTable =
  | 'property_types'
  | 'suppliers'
  | 'visit_types'
  | 'item_categories'
  | 'items';

const PATHS: Record<SimpleCatalogTable, string> = {
  property_types: '/catalogs/property-types',
  suppliers: '/catalogs/suppliers',
  visit_types: '/catalogs/visit-types',
  item_categories: '/catalogs/item-categories',
  items: '/catalogs/items'
};

export async function createCatalogRow(table: SimpleCatalogTable, formData: FormData) {
  const supabase = createClient();

  const payload: Record<string, unknown> = {
    name: String(formData.get('name') ?? '').trim()
  };
  if (!payload.name) return;

  if (table === 'item_categories') {
    payload.kind = String(formData.get('kind') ?? 'consumible');
  }
  if (table === 'items') {
    payload.category_id = String(formData.get('category_id') ?? '');
    payload.unit = String(formData.get('unit') ?? 'unidad');
  }
  if (table === 'suppliers') {
    const notes = String(formData.get('notes') ?? '').trim();
    if (notes) payload.notes = notes;
  }

  const { error } = await supabase.from(table).insert(payload as any);
  if (error) console.error(`[catalog:${table}] insert`, error);
  revalidatePath(PATHS[table]);
}

export async function toggleCatalogRow(table: SimpleCatalogTable, formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const active = String(formData.get('active') ?? '1') === '1';
  if (!id) return;

  const supabase = createClient();
  await supabase.from(table).update({ active: !active } as any).eq('id', id);
  revalidatePath(PATHS[table]);
}

export async function deleteCatalogRow(table: SimpleCatalogTable, formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const supabase = createClient();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) console.error(`[catalog:${table}] delete`, error);
  revalidatePath(PATHS[table]);
}
