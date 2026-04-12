import { requireProfile, hasRoleAtLeast } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BackButton } from '@/components/ui/back-button';
import { createDamageReport } from './actions';

export default async function NewDamagePage({
  searchParams
}: {
  searchParams: { property?: string; error?: string };
}) {
  const profile = await requireProfile();
  const supabase = createClient();
  const isSupervisor = hasRoleAtLeast(profile.role, 'supervisor');

  let properties: any[] = [];

  if (isSupervisor) {
    const { data } = await supabase.from('properties').select('id, nickname, title').eq('status', 'activa').order('nickname');
    properties = data ?? [];
  } else {
    const { data } = await supabase
      .from('property_assignments')
      .select('property_id, properties(id, nickname, title)')
      .eq('user_id', profile.id)
      .is('unassigned_at', null);
    properties = (data ?? []).map((a: any) => a.properties).filter(Boolean);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-24">
      <BackButton href="/damages" />

      <div>
        <p className="text-xs text-muted-foreground">Daños</p>
        <h1 className="text-2xl font-bold">Reportar daño</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Describe el daño con el mayor detalle posible. Podrás agregar fotos después de crear el reporte.
        </p>
      </div>

      {searchParams.error && (
        <Alert variant="destructive">
          <AlertDescription>{searchParams.error}</AlertDescription>
        </Alert>
      )}

      <form action={createDamageReport} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información del daño</CardTitle>
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
              <Label htmlFor="description">Descripción del daño</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                required
                placeholder="Ej: Vidrio de ventana del living quebrado, lado izquierdo. Se ve desde afuera."
              />
              <p className="text-[11px] text-muted-foreground">Sé lo más específico posible: ubicación exacta, tamaño, si afecta la funcionalidad.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgencia</Label>
              <Select id="urgency" name="urgency" defaultValue="media" required>
                <option value="baja">Baja — Estético, no afecta uso</option>
                <option value="media">Media — Afecta uso parcialmente</option>
                <option value="alta">Alta — Impide uso o es peligroso</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          Crear reporte de daño
        </Button>
      </form>
    </div>
  );
}
