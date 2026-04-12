'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createOccupation(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const property_id = String(formData.get('property_id') ?? '').trim();
  const reservation_code = String(formData.get('reservation_code') ?? '').trim();
  const checkin_date = String(formData.get('checkin_date') ?? '').trim();
  const checkout_date = String(formData.get('checkout_date') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!property_id || !reservation_code || !checkin_date || !checkout_date) {
    redirect(
      '/occupations/new?error=' +
        encodeURIComponent('Propiedad, código, check-in y check-out son requeridos')
    );
  }
  if (checkout_date <= checkin_date) {
    redirect(
      '/occupations/new?error=' +
        encodeURIComponent('La fecha de check-out debe ser posterior al check-in')
    );
  }
  if (!/^[A-Za-z0-9]{6,8}$/.test(reservation_code)) {
    redirect(
      '/occupations/new?error=' +
        encodeURIComponent('El código de reserva debe tener entre 6 y 8 caracteres alfanuméricos')
    );
  }

  const { data: overlaps, error: overlapError } = await supabase
    .from('occupations')
    .select('id')
    .eq('property_id', property_id)
    .lt('checkin_date', checkout_date)
    .gt('checkout_date', checkin_date)
    .limit(1);

  if (overlaps && overlaps.length > 0) {
    redirect(
      '/occupations/new?error=' +
        encodeURIComponent('Las fechas se solapan con una reserva existente en esta propiedad')
    );
  }

  const { data: occ, error } = await supabase
    .from('occupations')
    .insert({
      property_id,
      reservation_code,
      checkin_date,
      checkout_date,
      notes,
      registered_by: user!.id
    })
    .select('id')
    .single();

  if (error || !occ) {
    redirect(
      '/occupations/new?error=' +
        encodeURIComponent(error?.message ?? 'Error al crear la ocupación')
    );
  }

  revalidatePath('/occupations');
  redirect(`/occupations/${occ.id}`);
}

export async function deleteOccupation(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const { error } = await supabase.from('occupations').delete().eq('id', id);
  if (error) {
    redirect(`/occupations/${id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath('/occupations');
  redirect('/occupations');
}
