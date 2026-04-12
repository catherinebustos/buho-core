import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil, MapPin, Users, Ruler } from 'lucide-react';
import { requireProfile, hasRoleAtLeast } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AssignmentsPanel } from '@/components/properties/assignments-panel';
import { QrPreview } from '@/components/properties/qr-preview';
import { PropertyPhotosPanel } from '@/components/properties/photos-panel';
import { formatDateTime } from '@/lib/utils';
import type { Profile, Property, PropertyAssignment } from '@/lib/types/database.generated';

export default async function PropertyDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const profile = await requireProfile();
  const canManage = hasRoleAtLeast(profile.role, 'admin');
  const supabase = createClient();

  const { data: propertyRaw } = await supabase
    .from('properties')
    .select('*, property_types(name)')
    .eq('id', params.id)
    .maybeSingle();

  if (!propertyRaw) notFound();
  const property = propertyRaw as Property & { property_types: { name: string } | null };

  const { data: assignmentsRaw } = await supabase
    .from('property_assignments')
    .select('*, profiles(id, full_name, email, role)')
    .eq('property_id', params.id)
    .order('assigned_at', { ascending: false });

  const assignments = (assignmentsRaw ?? []) as unknown as (PropertyAssignment & {
    profiles: Pick<Profile, 'id' | 'full_name' | 'email' | 'role'> | null;
  })[];

  const { data: cleanersRaw } = canManage
    ? await supabase
        .from('profiles')
        .select('*')
        .in('role', ['cleaner', 'supervisor'])
        .eq('active', true)
        .order('full_name')
    : { data: [] };

  const { data: recentVisits } = await supabase
    .from('visits')
    .select('id, visit_at, via_qr, profiles(full_name), visit_types(name)')
    .eq('property_id', params.id)
    .order('visit_at', { ascending: false })
    .limit(5);

  const { data: photos } = await supabase
    .from('property_photos')
    .select('id, storage_path, caption')
    .eq('property_id', params.id)
    .order('created_at', { ascending: false });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{property.nickname}</p>
          <h1 className="text-2xl font-bold tracking-tight">{property.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant={property.status === 'activa' ? 'success' : 'secondary'}>
              {property.status}
            </Badge>
            {property.property_types ? (
              <span className="inline-flex items-center gap-1">· {property.property_types.name}</span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {property.city}
              {property.address ? `, ${property.address}` : ''}
            </span>
            {property.area_m2 ? (
              <span className="inline-flex items-center gap-1">
                <Ruler className="h-3 w-3" /> {property.area_m2} m²
              </span>
            ) : null}
            {property.guest_capacity ? (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" /> {property.guest_capacity}
              </span>
            ) : null}
          </div>
        </div>
        {canManage ? (
          <Link href={`/properties/${property.id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>
        ) : null}
      </div>

      {searchParams.error ? (
        <Alert variant="destructive">
          <AlertDescription>{searchParams.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal de limpieza</CardTitle>
              <CardDescription>Historial completo de asignaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <AssignmentsPanel
                propertyId={property.id}
                assignments={assignments}
                availableCleaners={(cleanersRaw as Profile[]) ?? []}
                canManage={canManage}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimas visitas</CardTitle>
              <CardDescription>Limpiezas y registros recientes</CardDescription>
            </CardHeader>
            <CardContent>
              {(recentVisits ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin visitas registradas aún.</p>
              ) : (
                <ul className="space-y-3">
                  {(recentVisits as any[]).map((v) => (
                    <li
                      key={v.id}
                      className="flex items-start justify-between rounded-md border border-border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{v.visit_types?.name ?? 'Visita'}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.profiles?.full_name ?? '—'} · {formatDateTime(v.visit_at)}
                        </p>
                      </div>
                      {v.via_qr ? <Badge variant="outline">QR</Badge> : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fotos</CardTitle>
              <CardDescription>Galería de la propiedad</CardDescription>
            </CardHeader>
            <CardContent>
              <PropertyPhotosPanel
                propertyId={property.id}
                photos={(photos ?? []) as { id: string; storage_path: string; caption: string | null }[]}
                supabaseUrl={supabaseUrl}
                canManage={canManage}
              />
            </CardContent>
          </Card>

          {property.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm">{property.notes}</CardContent>
            </Card>
          ) : null}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Código QR</CardTitle>
              <CardDescription>Imprime y pega en la unidad</CardDescription>
            </CardHeader>
            <CardContent>
              <QrPreview token={property.qr_token} nickname={property.nickname} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
