'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { DamageStatus } from '@/lib/types/database.generated';

const VALID_STATUSES: DamageStatus[] = ['pendiente', 'en_proceso', 'resuelto', 'descartado'];

export async function updateDamageStatus(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '') as DamageStatus;
  const resolution_notes = String(formData.get('resolution_notes') ?? '').trim() || null;

  if (!id || !VALID_STATUSES.includes(status)) {
    redirect(`/damages/${id}?error=` + encodeURIComponent('Estado inválido'));
  }

  const patch: Record<string, unknown> = { status, resolution_notes };
  if (status === 'resuelto' || status === 'descartado') {
    patch.resolved_at = new Date().toISOString();
  } else {
    patch.resolved_at = null;
  }

  const { error } = await supabase.from('damage_reports').update(patch).eq('id', id);
  if (error) {
    redirect(`/damages/${id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath('/damages');
  revalidatePath(`/damages/${id}`);
  redirect(`/damages/${id}`);
}
