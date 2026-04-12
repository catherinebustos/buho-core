export const BUCKETS = {
  PROPERTY_PHOTOS: 'property-photos',
  VISIT_PHOTOS: 'visit-photos',
  DAMAGE_PHOTOS: 'damage-photos'
} as const;

export function propertyPhotoPath(propertyId: string, filename: string) {
  const ts = Date.now();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${propertyId}/${ts}_${safe}`;
}

export function visitPhotoPath(visitId: string, stage: string, filename: string) {
  const ts = Date.now();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${visitId}/${stage}/${ts}_${safe}`;
}

export function damagePhotoPath(damageId: string, filename: string) {
  const ts = Date.now();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${damageId}/${ts}_${safe}`;
}

export function getPublicUrl(
  supabaseUrl: string,
  bucket: string,
  path: string
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
