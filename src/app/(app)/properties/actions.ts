'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function parseNumber(v: FormDataEntryValue | null) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseString(v: FormDataEntryValue | null) {
  const s = String(v ?? '').trim();
  return s === '' ? null : s;
}

export async function createProperty(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const payload = {
    nickname: String(formData.get('nickname') ?? '').trim(),
    title: String(formData.get('title') ?? '').trim(),
    property_type_id: parseString(formData.get('property_type_id')),
    country: String(formData.get('country') ?? 'Chile').trim(),
    city: String(formData.get('city') ?? '').trim(),
    address: parseString(formData.get('address')),
    area_m2: parseNumber(formData.get('area_m2')),
    guest_capacity: parseNumber(formData.get('guest_capacity')),
    status: String(formData.get('status') ?? 'activa') as 'activa' | 'inactiva',
    notes: parseString(formData.get('notes')),
    created_by: user.id
  };

  if (!payload.nickname || !payload.title || !payload.city) {
    redirect('/properties/new?error=' + encodeURIComponent('Nickname, título y ciudad son requeridos'));
  }

  const { data, error } = await supabase.from('properties').insert(payload).select('id').single();
  if (error) {
    redirect('/properties/new?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/properties');
  redirect(`/properties/${data!.id}`);
}

export async function updateProperty(id: string, formData: FormData) {
  const supabase = createClient();

  const payload = {
    nickname: String(formData.get('nickname') ?? '').trim(),
    title: String(formData.get('title') ?? '').trim(),
    property_type_id: parseString(formData.get('property_type_id')),
    country: String(formData.get('country') ?? 'Chile').trim(),
    city: String(formData.get('city') ?? '').trim(),
    address: parseString(formData.get('address')),
    area_m2: parseNumber(formData.get('area_m2')),
    guest_capacity: parseNumber(formData.get('guest_capacity')),
    status: String(formData.get('status') ?? 'activa') as 'activa' | 'inactiva',
    notes: parseString(formData.get('notes'))
  };

  const { error } = await supabase.from('properties').update(payload).eq('id', id);
  if (error) {
    redirect(`/properties/${id}/edit?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/properties/${id}`);
  revalidatePath('/properties');
  redirect(`/properties/${id}`);
}

export async function assignCleaner(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const property_id = String(formData.get('property_id') ?? '');
  const user_id = String(formData.get('user_id') ?? '');
  if (!property_id || !user_id) return;

  const { data: existing } = await supabase
    .from('property_assignments')
    .select('id')
    .eq('property_id', property_id)
    .eq('user_id', user_id)
    .is('unassigned_at', null)
    .single();

  if (existing) {
    redirect(`/properties/${property_id}?error=` + encodeURIComponent('El usuario ya está asignado a esta propiedad'));
  }

  const { error } = await supabase.from('property_assignments').insert({
    property_id,
    user_id,
    assigned_by: user.id
  });

  if (error) {
    redirect(`/properties/${property_id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/properties/${property_id}`);
  redirect(`/properties/${property_id}`);
}

export async function unassignCleaner(formData: FormData) {
  const supabase = createClient();
  const assignment_id = String(formData.get('assignment_id') ?? '');
  const property_id = String(formData.get('property_id') ?? '');

  const { error } = await supabase
    .from('property_assignments')
    .update({ unassigned_at: new Date().toISOString() })
    .eq('id', assignment_id);

  if (error) {
    redirect(`/properties/${property_id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/properties/${property_id}`);
  redirect(`/properties/${property_id}`);
}
