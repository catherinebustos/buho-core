'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BUCKETS } from '@/lib/supabase/storage';

export async function savePropertyPhoto(propertyId: string, storagePath: string) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('property_photos').insert({
    property_id: propertyId,
    storage_path: storagePath,
    uploaded_by: user.id
  });

  revalidatePath(`/properties/${propertyId}`);
}

export async function deletePropertyPhoto(formData: FormData) {
  const supabase = createClient();
  const photoId = String(formData.get('photo_id') ?? '');
  const storagePath = String(formData.get('storage_path') ?? '');
  const propertyId = String(formData.get('property_id') ?? '');

  if (!photoId) return;

  // Eliminar de Storage
  if (storagePath) {
    await supabase.storage.from(BUCKETS.PROPERTY_PHOTOS).remove([storagePath]);
  }

  // Eliminar registro de DB
  const { error } = await supabase.from('property_photos').delete().eq('id', photoId);
  if (error) {
    redirect(`/properties/${propertyId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/properties/${propertyId}`);
  redirect(`/properties/${propertyId}`);
}
