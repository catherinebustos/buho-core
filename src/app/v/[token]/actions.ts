'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function parseNum(v: FormDataEntryValue | null) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function submitVisit(token: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/v/${token}`)}`);

  const { data: property } = await supabase
    .from('properties')
    .select('id, nickname')
    .eq('qr_token', token)
    .maybeSingle();
  if (!property) redirect(`/v/${token}?error=${encodeURIComponent('Propiedad no encontrada')}`);

  const visit_type_id = String(formData.get('visit_type_id') ?? '');
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!visit_type_id) {
    redirect(`/v/${token}?error=${encodeURIComponent('Selecciona el tipo de visita')}`);
  }

  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .insert({
      property_id: property!.id,
      visit_type_id,
      performed_by: user!.id,
      via_qr: true,
      notes
    })
    .select('id')
    .single();

  if (visitError || !visit) {
    redirect(`/v/${token}?error=${encodeURIComponent(visitError?.message ?? 'Error al guardar')}`);
  }

  // Items usados: llegan como pares item_<id>_qty
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

  // Reporte de daño opcional
  const damage_description = String(formData.get('damage_description') ?? '').trim();
  if (damage_description) {
    const urgency = String(formData.get('damage_urgency') ?? 'media') as
      | 'baja'
      | 'media'
      | 'alta';
    await supabase.from('damage_reports').insert({
      visit_id: visit.id,
      property_id: property!.id,
      description: damage_description,
      urgency,
      reported_by: user!.id
    });
  }

  revalidatePath(`/v/${token}`);
  revalidatePath(`/properties/${property!.id}`);
  redirect(`/v/${token}/success?visitId=${visit.id}`);
}
