import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/form-select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createOccupation } from '../actions';

export default async function NewOccupationPage({
  searchParams
}: {
  searchParams: { error?: string; property?: string };
}) {
  await requireRole('supervisor');
  const supabase = createClient();

  const { data: properties } = await supabase
    .from('properties')
    .select('id, nickname')
    .eq('status', 'activa')
    .order('nickname');

  const props = (properties ?? []) as { id: string; nickname: string }[];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/occupations" />
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nueva ocupación</h1>
        <p className="text-sm text-muted-foreground">
          Registra la reserva con código, fechas y propiedad asociada.
        </p>
      </div>

      {searchParams.error ? (
        <Alert variant="destructive">
          <AlertDescription>{searchParams.error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de la ocupación</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createOccupation} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="property_id">Propiedad *</Label>
              <FormSelect
                name="property_id"
                defaultValue={searchParams.property ?? ''}
                placeholder="— Selecciona —"
                required
                options={props.map(p => ({ label: p.nickname, value: p.id }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reservation_code">Código de reserva *</Label>
              <Input
                id="reservation_code"
                name="reservation_code"
                placeholder="HMXXXXXX"
                minLength={6}
                maxLength={8}
                pattern="[A-Za-z0-9]{6,8}"
                required
              />
              <p className="text-xs text-muted-foreground">
                6 a 8 caracteres alfanuméricos (Airbnb, Booking, VRBO, directo).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkin_date">Check-in *</Label>
              <Input
                id="checkin_date"
                name="checkin_date"
                type="date"
                defaultValue={today}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkout_date">Check-out *</Label>
              <Input id="checkout_date" name="checkout_date" type="date" required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>

            <div className="flex items-center justify-end gap-2 md:col-span-2">
              <Link href="/occupations">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit">Registrar ocupación</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
