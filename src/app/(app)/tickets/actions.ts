'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface TicketLine {
  item_id: string;
  property_id: string | null;
  quantity: number;
  unit_price: number;
  notes: string | null;
}

function parseLines(raw: string | null): TicketLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((l: any) => ({
        item_id: String(l.item_id ?? ''),
        property_id: l.property_id ? String(l.property_id) : null,
        quantity: Number(l.quantity) || 0,
        unit_price: Number(l.unit_price) || 0,
        notes: l.notes ? String(l.notes).trim() || null : null
      }))
      .filter((l) => l.item_id && l.quantity > 0);
  } catch {
    return [];
  }
}

export async function createTicket(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const ticket_number = String(formData.get('ticket_number') ?? '').trim();
  const purchase_date = String(formData.get('purchase_date') ?? '').trim();
  const supplier_id = String(formData.get('supplier_id') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim() || null;
  const lines = parseLines(String(formData.get('lines') ?? ''));

  if (!ticket_number || !purchase_date || !supplier_id) {
    redirect('/tickets/new?error=' + encodeURIComponent('Número, fecha y proveedor son requeridos'));
  }
  if (lines.length === 0) {
    redirect('/tickets/new?error=' + encodeURIComponent('Agrega al menos una línea al ticket'));
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('purchase_tickets')
    .insert({
      ticket_number,
      purchase_date,
      supplier_id,
      registered_by: user!.id,
      notes
    })
    .select('id')
    .single();

  if (ticketError || !ticket) {
    redirect(
      '/tickets/new?error=' + encodeURIComponent(ticketError?.message ?? 'Error al crear ticket')
    );
  }

  const { error: linesError } = await supabase
    .from('ticket_items')
    .insert(lines.map((l) => ({ ...l, ticket_id: ticket.id })));

  if (linesError) {
    await supabase.from('purchase_tickets').delete().eq('id', ticket.id);
    redirect('/tickets/new?error=' + encodeURIComponent(linesError.message));
  }

  revalidatePath('/tickets');
  redirect(`/tickets/${ticket.id}`);
}

export async function deleteTicket(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const { error } = await supabase.from('purchase_tickets').delete().eq('id', id);
  if (error) {
    redirect(`/tickets/${id}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath('/tickets');
  redirect('/tickets');
}
