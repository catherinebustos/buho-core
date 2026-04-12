'use server';

import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function createMaintenanceRequest(formData: FormData) {
  const profile = await requireRole('supervisor');
  const supabase = createClient();

  const payload = {
    property_id:      formData.get('property_id') as string,
    title:            formData.get('title') as string,
    description:      (formData.get('description') as string) || null,
    category:         formData.get('category') as string,
    urgency:          formData.get('urgency') as string,
    scheduled_date:   (formData.get('scheduled_date') as string) || null,
    estimated_cost:   formData.get('estimated_cost') ? Number(formData.get('estimated_cost')) : null,
    damage_report_id: (formData.get('damage_report_id') as string) || null,
    assigned_to:      (formData.get('assigned_to') as string) || null,
    notes:            (formData.get('notes') as string) || null,
    reported_by:      profile.id,
  };

  const { data, error } = await (supabase as any)
    .from('maintenance_requests')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  redirect(`/maintenance/${(data as any).id}`);
}

export async function updateMaintenanceRequest(id: string, formData: FormData) {
  const profile = await requireRole('maintenance');
  const supabase = createClient();
  const { hasRoleAtLeast } = await import('@/lib/auth');
  const isSupervisorPlus = hasRoleAtLeast(profile.role, 'supervisor');

  // Campos que cualquier asignado puede cambiar
  const basePayload: Record<string, unknown> = {
    status:       formData.get('status') as string,
    actual_cost:  formData.get('actual_cost') ? Number(formData.get('actual_cost')) : null,
    completed_date: (formData.get('completed_date') as string) || null,
    notes:        (formData.get('notes') as string) || null,
  };

  // Campos adicionales solo para supervisores+
  if (isSupervisorPlus) {
    Object.assign(basePayload, {
      title:           formData.get('title') as string,
      description:     (formData.get('description') as string) || null,
      category:        formData.get('category') as string,
      urgency:         formData.get('urgency') as string,
      scheduled_date:  (formData.get('scheduled_date') as string) || null,
      estimated_cost:  formData.get('estimated_cost') ? Number(formData.get('estimated_cost')) : null,
      assigned_to:     (formData.get('assigned_to') as string) || null,
    });
  }

  const { error } = await (supabase as any)
    .from('maintenance_requests')
    .update(basePayload)
    .eq('id', id);

  if (error) throw new Error(error.message);
  redirect(`/maintenance/${id}`);
}
