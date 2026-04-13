import { notFound } from 'next/navigation';
import { BackButton } from '@/components/ui/back-button';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { TicketForm } from '@/components/tickets/ticket-form';
import { updateTicket } from '../../actions';
import type { Tables } from '@/lib/types/database.generated';
type Item = Tables<'items'>;
type Property = Tables<'properties'>;
type Supplier = Tables<'suppliers'>;

export default async function EditTicketPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  await requireRole('supervisor');
  const supabase = createClient();

  const [{ data: ticket }, { data: ticketItems }, { data: suppliers }, { data: items }, { data: properties }] =
    await Promise.all([
      supabase
        .from('purchase_tickets')
        .select('id, ticket_number, purchase_date, supplier_id, notes, property_id')
        .eq('id', params.id)
        .maybeSingle(),
      supabase
        .from('ticket_items')
        .select('item_id, quantity, unit_price, notes')
        .eq('ticket_id', params.id),
      supabase.from('suppliers').select('*').eq('active', true).order('name'),
      supabase.from('items').select('*').eq('active', true).order('name'),
      supabase.from('properties').select('id, nickname').eq('status', 'activa').order('nickname')
    ]);

  if (!ticket) notFound();

  const t = ticket as any;

  const defaultLines = ((ticketItems as any[]) ?? []).map((li: any) => ({
    key: Math.random().toString(36).slice(2, 10),
    item_id: li.item_id,
    quantity: String(li.quantity),
    unit_price: String(li.unit_price),
    notes: li.notes ?? ''
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href={`/tickets/${params.id}`} />
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Editar ticket{' '}
          <span className="font-mono text-muted-foreground">{t.ticket_number}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Todos los cambios quedan registrados en la auditoría del sistema.
        </p>
      </div>

      <TicketForm
        action={updateTicket}
        suppliers={(suppliers as Supplier[]) ?? []}
        items={(items as Item[]) ?? []}
        properties={(properties as Pick<Property, 'id' | 'nickname'>[]) ?? []}
        error={searchParams.error}
        hiddenFields={{ id: params.id }}
        submitLabel="Guardar cambios"
        defaultValues={{
          ticket_number: t.ticket_number,
          purchase_date: t.purchase_date,
          supplier_id: t.supplier_id,
          property_id: t.property_id ?? '',
          notes: t.notes ?? '',
          lines: defaultLines.length > 0 ? defaultLines : undefined
        }}
      />
    </div>
  );
}
