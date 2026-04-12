'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

function parseNum(v: FormDataEntryValue | null) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function createVisit(formData: FormData) {
  const profile = await requireProfile();
  const supabase = createClient();

  const property_id = String(formData.get('property_id') ?? '');
  const visit_type_id = String(formData.get('visit_type_id') ?? '');
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!property_id || !visit_type_id) {
    redirect('/visits/new?error=' + encodeURIComponent('Completa los campos obligatorios'));
  }

  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .insert({
      property_id,
      visit_type_id,
      performed_by: profile.id,
      via_qr: false,
      notes
    })
    .select('id')
    .single();

  if (visitError || !visit) {
    redirect('/visits/new?error=' + encodeURIComponent(visitError?.message ?? 'Error al guardar'));
  }

  const itemsUsed: { item_id: string; quantity: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('item_') && key.endsWith('_qty')) {
      const qty = parseNum(value);
      if (qty) {
        const item_id = key.slice('item_'.length, -'_qty'.length);
        itemsUsed.push({ item_id, quantity: qty });
      }
    }
  }

  if (itemsUsed.length > 0) {
    await supabase
      .from('visit_items_used')
      .insert(itemsUsed.map((i) => ({ ...i, visit_id: visit.id })));
  }

  const damage_description = String(formData.get('damage_description') ?? '').trim();
  if (damage_description) {
    const urgency = String(formData.get('damage_urgency') ?? 'media') as 'baja' | 'media' | 'alta';
    await supabase.from('damage_reports').insert({
      visit_id: visit.id,
      property_id,
      description: damage_description,
      urgency,
      reported_by: profile.id
    });
  }

  revalidatePath('/visits');
  revalidatePath('/dashboard');
  redirect(`/visits/${visit.id}`);
}
