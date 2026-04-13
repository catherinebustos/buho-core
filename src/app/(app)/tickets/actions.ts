'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireRole, hasRoleAtLeast } from '@/lib/auth';

interface TicketLine {
  item_id: string;
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
  const property_id = String(formData.get('property_id') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;
  const lines = parseLines(String(formData.get('lines') ?? ''));

  if (!ticket_number || !purchase_date || !supplier_id) {
    redirect('/tickets/new?error=' + encodeURIComponent('Número, fecha y proveedor son requeridos'));
  }
  if (lines.length === 0) {
    redirect('/tickets/new?error=' + encodeURIComponent('Agrega al menos una línea al ticket'));
  }

  // Calcular total localmente para no depender solo del trigger
  const computedTotal = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);

  const { data: ticket, error: ticketError } = await supabase
    .from('purchase_tickets')
    .insert({
      ticket_number,
      purchase_date,
      supplier_id,
      property_id,
      registered_by: user!.id,
      notes,
      total: computedTotal
    } as any)
    .select('id')
    .single();

  if (ticketError || !ticket) {
    redirect(
      '/tickets/new?error=' + encodeURIComponent(ticketError?.message ?? 'Error al crear ticket')
    );
  }

  // Insertar líneas — property_id se propaga del ticket a cada línea
  const { error: linesError } = await supabase
    .from('ticket_items')
    .insert(
      lines.map((l) => ({
        ...l,
        ticket_id: ticket.id,
        property_id // misma propiedad del ticket en cada línea
      }))
    );

  if (linesError) {
    await supabase.from('purchase_tickets').delete().eq('id', ticket.id);
    redirect('/tickets/new?error=' + encodeURIComponent(linesError.message));
  }

  // Forzar recálculo del total vía UPDATE por si el trigger tuvo algún timing issue
  await supabase
    .from('purchase_tickets')
    .update({ total: computedTotal } as any)
    .eq('id', ticket.id);

  revalidatePath('/tickets');
  redirect(`/tickets/${ticket.id}`);
}

export async function updateTicket(formData: FormData) {
  const profile = await requireRole('supervisor');
  const supabase = createClient();

  const id = String(formData.get('id') ?? '').trim();
  if (!id) redirect('/tickets');

  const ticket_number = String(formData.get('ticket_number') ?? '').trim();
  const purchase_date = String(formData.get('purchase_date') ?? '').trim();
  const supplier_id = String(formData.get('supplier_id') ?? '').trim();
  const property_id = String(formData.get('property_id') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;
  const lines = parseLines(String(formData.get('lines') ?? ''));

  if (!ticket_number || !purchase_date || !supplier_id) {
    redirect(`/tickets/${id}/edit?error=` + encodeURIComponent('Número, fecha y proveedor son requeridos'));
  }
  if (lines.length === 0) {
    redirect(`/tickets/${id}/edit?error=` + encodeURIComponent('Agrega al menos una línea al ticket'));
  }

  const computedTotal = lines.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);

  // Actualizar encabezado del ticket
  const { error: ticketError } = await supabase
    .from('purchase_tickets')
    .update({
      ticket_number,
      purchase_date,
      supplier_id,
      property_id,
      notes,
      total: computedTotal
    } as any)
    .eq('id', id);

  if (ticketError) {
    redirect(`/tickets/${id}/edit?error=` + encodeURIComponent(ticketError.message));
  }

  // Reemplazar todas las líneas (borrar + reinsertar)
  const { error: deleteError } = await supabase
    .from('ticket_items')
    .delete()
    .eq('ticket_id', id);

  if (deleteError) {
    redirect(`/tickets/${id}/edit?error=` + encodeURIComponent(deleteError.message));
  }

  const { error: linesError } = await supabase
    .from('ticket_items')
    .insert(
      lines.map((l) => ({
        ...l,
        ticket_id: id,
        property_id
      }))
    );

  if (linesError) {
    redirect(`/tickets/${id}/edit?error=` + encodeURIComponent(linesError.message));
  }

  revalidatePath('/tickets');
  revalidatePath(`/tickets/${id}`);
  redirect(`/tickets/${id}`);
}

export async function deleteTicket(formData: FormData) {
  const profile = await requireRole('supervisor');
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
