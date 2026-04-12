import { redirect } from 'next/navigation';
import { requireProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BackButton } from '@/components/ui/back-button';
import { Badge } from '@/components/ui/badge';
import { createVisit } from './actions';

import { hasRoleAtLeast } from '@/lib/auth';

export default async function NewVisitPage({
  searchParams
}: {
  searchParams: { property?: string; error?: string };
}) {
  const profile = await requireProfile();
  const supabase = createClient();

  const isManagement = hasRoleAtLeast(profile.role as any, 'supervisor');

  const [propsQuery, visitTypesQuery, itemsRawQuery] = await Promise.all([
    isManagement
      ? supabase.from('properties').select('id, nickname, title').eq('status', 'activa').order('nickname')
      : supabase
          .from('property_assignments')
          .select('property_id, properties(id, nickname, title)')
          .eq('user_id', profile.id)
          .is('unassigned_at', null),
    supabase.from('visit_types').select('*').eq('active', true).order('sort_order'),
    supabase.from('items').select('id, name, unit, item_categories(name, kind)').eq('active', true).order('name'),
  ]);

  let properties = [];
  if (isManagement) {
    properties = propsQuery.data ?? [];
  } else {
    properties = (propsQuery.data ?? []).map((a: any) => a.properties).filter(Boolean);
  }

  const visitTypes = visitTypesQuery.data;
  const itemsRaw = itemsRawQuery.data;
  const consumables = (itemsRaw ?? []).filter((i: any) => i.item_categories?.kind === 'consumible');
  const esporadicos = (itemsRaw ?? []).filter((i: any) => i.item_categories?.kind === 'esporadico');

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-24">
      <BackButton href="/visits" />

      <div>
        <p className="text-xs text-muted-foreground">Check-list</p>
        <h1 className="text-2xl font-bold">Check-list de Limpieza</h1>
      </div>

      {searchParams.error && (
        <Alert variant="destructive">
          <AlertDescription>{searchParams.error}</AlertDescription>
        </Alert>
      )}

      <form action={createVisit} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Propiedad y tipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property_id">Propiedad</Label>
              <Select id="property_id" name="property_id" defaultValue={searchParams.property ?? ''} required>
                <option value="">— Selecciona —</option>
                {properties.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.nickname} — {p.title}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visit_type_id">Tipo de visita</Label>
              <Select id="visit_type_id" name="visit_type_id" required>
                <option value="">— Selecciona —</option>
                {(visitTypes ?? []).map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observaciones</Label>
              <Textarea id="notes" name="notes" rows={3} placeholder="Estado general, novedades..." />
            </div>
          </CardContent>
        </Card>

        {consumables.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Insumos disponibles al irse (Inventario final)</CardTitle>
              <p className="text-xs text-muted-foreground">Registre cuánto queda al finalizar (Ej: 0.5 para la mitad, 0.75 para 3/4)</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {consumables.map((it: any) => (
                <div key={it.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-muted-foreground">{it.unit}</p>
                  </div>
                  <Input type="number" min="0" step="0.01" name={`item_${it.id}_qty`} placeholder="Ej: 0.5" className="w-24" inputMode="decimal" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {esporadicos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Elementos utilizados o reemplazados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {esporadicos.map((it: any) => (
                <div key={it.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{it.name}</p>
                    <Badge variant="outline" className="mt-1">{it.unit}</Badge>
                  </div>
                  <Input type="number" min="0" step="1" name={`item_${it.id}_qty`} placeholder="0" className="w-24" inputMode="numeric" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="border-red-100 bg-red-50/30">
          <CardHeader>
            <CardTitle className="text-base text-red-900">¿Reportar un daño o algo faltante?</CardTitle>
            <p className="text-xs text-red-700/80">Usa esto si notas que falta algo en la propiedad o si algo requiere reparación urgente de mantenimiento.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="damage_description">Descripción (opcional)</Label>
              <Textarea id="damage_description" name="damage_description" rows={3} placeholder="Ej: espejo del baño roto" />
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

        <Button type="submit" size="lg" className="w-full text-base font-bold">
          Finalizar y enviar Check-list
        </Button>
      </form>
    </div>
  );
}
