import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { TicketForm } from '@/components/tickets/ticket-form';
import { createTicket } from '../actions';
import type { Tables } from '@/lib/types/database.generated';
type Item = Tables<'items'>;
type Property = Tables<'properties'>;
type Supplier = Tables<'suppliers'>;

export default async function NewTicketPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  await requireRole('supervisor');
  const supabase = createClient();

  const [{ data: suppliers }, { data: items }, { data: properties }] = await Promise.all([
    supabase.from('suppliers').select('*').eq('active', true).order('name'),
    supabase.from('items').select('*').eq('active', true).order('name'),
    supabase.from('properties').select('id, nickname').eq('status', 'activa').order('nickname')
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo ticket de compra</h1>
        <p className="text-sm text-muted-foreground">
          Registra cada línea de la boleta. Puedes asociar cada ítem a una propiedad o dejarlo como
          gasto general.
        </p>
      </div>
      <TicketForm
        action={createTicket}
        suppliers={(suppliers as Supplier[]) ?? []}
        items={(items as Item[]) ?? []}
        properties={(properties as Pick<Property, 'id' | 'nickname'>[]) ?? []}
        error={searchParams.error}
      />
    </div>
  );
}
