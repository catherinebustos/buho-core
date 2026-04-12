'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { PhotoUploader } from '@/components/storage/photo-uploader';
import { BUCKETS, propertyPhotoPath } from '@/lib/supabase/storage';
import { deletePropertyPhoto, savePropertyPhoto } from '@/app/(app)/properties/photo-actions';

interface Photo {
  id: string;
  storage_path: string;
  caption: string | null;
}

interface PropertyPhotosPanelProps {
  propertyId: string;
  photos: Photo[];
  supabaseUrl: string;
  canManage: boolean;
}

export function PropertyPhotosPanel({
  propertyId,
  photos,
  supabaseUrl,
  canManage
}: PropertyPhotosPanelProps) {
  function publicUrl(path: string) {
    return `${supabaseUrl}/storage/v1/object/public/${BUCKETS.PROPERTY_PHOTOS}/${path}`;
  }

  return (
    <div className="space-y-4">
      {photos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin fotos cargadas todavía.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-md border border-border">
              <div className="relative aspect-square">
                <Image
                  src={publicUrl(photo.storage_path)}
                  alt={photo.caption ?? 'Foto propiedad'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
              {canManage ? (
                <form
                  action={deletePropertyPhoto}
                  className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <input type="hidden" name="photo_id" value={photo.id} />
                  <input type="hidden" name="storage_path" value={photo.storage_path} />
                  <input type="hidden" name="property_id" value={propertyId} />
                  <button
                    type="submit"
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive text-destructive-foreground hover:opacity-90"
                    title="Eliminar foto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {canManage ? (
        <PhotoUploader
          bucket={BUCKETS.PROPERTY_PHOTOS}
          buildPath={(filename) => propertyPhotoPath(propertyId, filename)}
          onUploaded={(path) => savePropertyPhoto(propertyId, path)}
          label="Agregar foto"
        />
      ) : null}
    </div>
  );
}
