'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function createDamageReport(formData: FormData) {
  const profile = await requireProfile();
  const supabase = createClient();

  const property_id = String(formData.get('property_id') ?? '');
  const description = String(formData.get('description') ?? '').trim();
  const urgency = String(formData.get('urgency') ?? 'media') as 'baja' | 'media' | 'alta';

  if (!property_id || !description) {
    redirect('/damages/new?error=' + encodeURIComponent('Completa los campos obligatorios'));
  }

  const { data, error } = await supabase
    .from('damage_reports')
    .insert({
      property_id,
      description,
      urgency,
      reported_by: profile.id
    })
    .select('id')
    .single();

  if (error || !data) {
    redirect('/damages/new?error=' + encodeURIComponent(error?.message ?? 'Error al guardar'));
  }

  revalidatePath('/damages');
  revalidatePath('/dashboard');
  redirect(`/damages/${data.id}`);
}
