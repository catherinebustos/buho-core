import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { MapPin, QrCode } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { submitVisit } from './actions';
import type { Tables } from '@/lib/types/database.generated';
type Item = Tables<'items'>;
type ItemCategory = Tables<'item_categories'>;
type VisitType = Tables<'visit_types'>;

export default async function QrVisitPage({
  params,
  searchParams
}: {
  params: { token: string };
  searchParams: { error?: string };
}) {
  const supabase = createClient();

  const { data: property } = await supabase
    .from('properties')
    .select('id, nickname, title, city, address, property_types(name)')
    .eq('qr_token', params.token)
    .maybeSingle();

  if (!property) notFound();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/v/${params.token}`)}`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user!.id)
    .maybeSingle();

  if (!profile) {
    redirect('/login');
  }

  const [{ data: visitTypes }, { data: itemsRaw }] = await Promise.all([
    supabase.from('visit_types').select('*').eq('active', true).order('sort_order'),
    supabase
      .from('items')
      .select('id, name, unit, item_categories(name, kind)')
      .eq('active', true)
      .order('name')
  ]);

  const items = (itemsRaw ?? []) as unknown as (Item & {
    item_categories: Pick<ItemCategory, 'name' | 'kind'> | null;
  })[];

  const consumables = items.filter((i) => i.item_categories?.kind === 'consumible');
  const esporadicos = items.filter((i) => i.item_categories?.kind === 'esporadico');

  const submit = submitVisit.bind(null, params.token);
  const prop = property as any;

  return (
    <main className="min-h-dvh bg-background pb-16">
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-buho-500 text-white">
            <QrCode className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted-foreground">{prop.nickname}</p>
            <p className="truncate text-sm font-semibold">{prop.title}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {prop.city}
              {prop.address ? `, ${prop.address}` : ''}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registrar visita</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Hola <span className="font-semibold">{profile.full_name.split(' ')[0]}</span>, vas a
              registrar una visita a esta propiedad.
            </p>
          </CardContent>
        </Card>

        {searchParams.error ? (
          <Alert variant="destructive">
            <AlertDescription>{searchParams.error}</AlertDescription>
          </Alert>
        ) : null}

        <form action={submit} className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tipo de visita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="visit_type_id">¿Qué tipo de limpieza / inspección realizas?</Label>
                <Select id="visit_type_id" name="visit_type_id" required>
                  <option value="">— Selecciona —</option>
                  {(visitTypes as VisitType[] | null)?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observaciones y novedades</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consumibles utilizados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {consumables.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin consumibles en catálogo.</p>
              ) : (
                consumables.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{it.name}</p>
                      <p className="text-xs text-muted-foreground">{it.unit}</p>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      name={`item_${it.id}_qty`}
                      placeholder="0"
                      className="w-24"
                      inputMode="decimal"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Elementos reemplazados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {esporadicos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin elementos esporádicos.</p>
              ) : (
                esporadicos.map((it) => (
                  <div key={it.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{it.name}</p>
                      <Badge variant="outline" className="mt-1">
                        {it.unit}
                      </Badge>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      name={`item_${it.id}_qty`}
                      placeholder="0"
                      className="w-24"
                      inputMode="numeric"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">¿Reportar un daño?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="damage_description">Descripción (opcional)</Label>
                <Textarea
                  id="damage_description"
                  name="damage_description"
                  rows={3}
                  placeholder="Ej: espejo del baño roto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="damage_urgency">Urgencia</Label>
                <Select id="damage_urgency" name="damage_urgency" defaultValue="media">
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-4 flex gap-2">
            <Button type="submit" size="lg" className="flex-1">
              Registrar visita
            </Button>
          </div>
        </form>

        <p className="pt-4 text-center text-xs text-muted-foreground">
          <Link href="/dashboard" className="underline">
            Volver al dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
