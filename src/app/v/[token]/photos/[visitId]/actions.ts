'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { BUCKETS } from '@/lib/supabase/storage';

export async function saveVisitPhoto(
  visitId: string,
  storagePath: string,
  stage: string
) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('visit_photos').insert({
    visit_id: visitId,
    storage_path: storagePath,
    stage: stage as 'antes' | 'durante' | 'despues' | 'otro',
    uploaded_by: user.id
  });

  revalidatePath(`/visits/${visitId}`);
}

export async function deleteVisitPhoto(formData: FormData) {
  const supabase = createClient();
  const photoId = String(formData.get('photo_id') ?? '');
  const storagePath = String(formData.get('storage_path') ?? '');

  if (!photoId) return;

  if (storagePath) {
    await supabase.storage.from(BUCKETS.VISIT_PHOTOS).remove([storagePath]);
  }

  await supabase.from('visit_photos').delete().eq('id', photoId);
}
