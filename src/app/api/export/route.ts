import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth';

// ── Helpers ────────────────────────────────────────────────────────

function toSheet(data: Record<string, unknown>[], headers: string[]) {
  if (data.length === 0) {
    return XLSX.utils.aoa_to_sheet([headers]);
  }
  const ws = XLSX.utils.json_to_sheet(data, { header: headers, skipHeader: false });
  return ws;
}

function fmt(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'Sí' : 'No';
  return String(v);
}

// ── Handler ────────────────────────────────────────────────────────
export async function GET() {
  // Requiere rol admin o superior
  await requireRole('admin');

  const supabase = createAdminClient();

  // Paralelizar todas las consultas
  const [
    { data: props },
    { data: occupations },
    { data: visits },
    { data: damages },
    { data: maintenance },
    { data: tickets },
    { data: ticketItems },
    { data: profiles },
    { data: assignments },
  ] = await Promise.all([
    supabase
      .from('properties')
      .select('nickname, title, city, country, address, area_m2, guest_capacity, status, notes, created_at')
      .order('nickname'),
    supabase
      .from('occupations')
      .select('reservation_code, checkin_date, checkout_date, nights, notes, registered_by, created_at, properties(nickname)')
      .order('checkin_date', { ascending: false }),
    supabase
      .from('visits')
      .select('visit_at, notes, via_qr, created_at, properties(nickname), visit_types(name), profiles(full_name)')
      .order('visit_at', { ascending: false }),
    supabase
      .from('damage_reports')
      .select('description, urgency, status, reported_at, resolved_at, resolution_notes, properties(nickname), profiles!reported_by(full_name)')
      .order('reported_at', { ascending: false }),
    supabase
      .from('maintenance_requests' as any)
      .select('title, category, status, urgency, scheduled_date, completed_date, estimated_cost, actual_cost, notes, created_at, properties(nickname), reporter:reported_by(full_name), assignee:assigned_to(full_name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('purchase_tickets')
      .select('ticket_number, purchase_date, total, notes, created_at, suppliers(name), profiles!registered_by(full_name)')
      .order('purchase_date', { ascending: false }),
    supabase
      .from('ticket_items')
      .select('quantity, unit_price, subtotal, notes, properties(nickname), items(name), purchase_tickets(ticket_number)')
      .order('created_at' as any, { ascending: false }),
    supabase
      .from('profiles')
      .select('full_name, email, role, phone, active, created_at')
      .order('full_name'),
    supabase
      .from('property_assignments')
      .select('assigned_at, unassigned_at, notes, properties(nickname), profiles!user_id(full_name)')
      .order('assigned_at', { ascending: false }),
  ]);

  // ── Construir workbook ─────────────────────────────────────────
  const wb = XLSX.utils.book_new();

  // 1. Propiedades
  const propRows = (props ?? []).map((r: any) => ({
    'Apodo':            fmt(r.nickname),
    'Nombre':           fmt(r.title),
    'Ciudad':           fmt(r.city),
    'País':             fmt(r.country),
    'Dirección':        fmt(r.address),
    'M²':               fmt(r.area_m2),
    'Capacidad':        fmt(r.guest_capacity),
    'Estado':           fmt(r.status),
    'Notas':            fmt(r.notes),
    'Creada':           fmt(r.created_at?.slice(0, 10)),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(propRows), 'Propiedades');

  // 2. Ocupaciones
  const occRows = (occupations ?? []).map((r: any) => ({
    'Propiedad':     fmt((r.properties as any)?.nickname),
    'Código reserva': fmt(r.reservation_code),
    'Check-in':      fmt(r.checkin_date),
    'Check-out':     fmt(r.checkout_date),
    'Noches':        fmt(r.nights),
    'Registrado por': fmt((r as any).profiles?.full_name ?? r.registered_by),
    'Notas':         fmt(r.notes),
    'Creada':        fmt(r.created_at?.slice(0, 10)),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(occRows.length ? occRows : [{ '': 'Sin datos' }]), 'Ocupaciones');

  // 3. Visitas / Limpiezas
  const visitRows = (visits ?? []).map((r: any) => ({
    'Propiedad':   fmt((r.properties as any)?.nickname),
    'Tipo':        fmt((r.visit_types as any)?.name),
    'Realizada por': fmt((r.profiles as any)?.full_name),
    'Fecha':       fmt(r.visit_at?.slice(0, 16).replace('T', ' ')),
    'Vía QR':      r.via_qr ? 'Sí' : 'No',
    'Notas':       fmt(r.notes),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(visitRows.length ? visitRows : [{ '': 'Sin datos' }]), 'Visitas');

  // 4. Daños
  const dmgRows = (damages ?? []).map((r: any) => ({
    'Propiedad':      fmt((r.properties as any)?.nickname),
    'Descripción':    fmt(r.description),
    'Urgencia':       fmt(r.urgency),
    'Estado':         fmt(r.status),
    'Reportado por':  fmt((r as any)['profiles!reported_by']?.full_name ?? (r.profiles as any)?.full_name),
    'Reportado':      fmt(r.reported_at?.slice(0, 10)),
    'Resuelto':       fmt(r.resolved_at?.slice(0, 10)),
    'Notas resolución': fmt(r.resolution_notes),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dmgRows.length ? dmgRows : [{ '': 'Sin datos' }]), 'Daños');

  // 5. Mantenimiento
  const maintRows = (maintenance ?? []).map((r: any) => ({
    'Propiedad':       fmt((r.properties as any)?.nickname),
    'Título':          fmt(r.title),
    'Categoría':       fmt(r.category),
    'Estado':          fmt(r.status),
    'Urgencia':        fmt(r.urgency),
    'Reportado por':   fmt((r.reporter as any)?.full_name),
    'Asignado a':      fmt((r.assignee as any)?.full_name),
    'Fecha programada': fmt(r.scheduled_date),
    'Fecha completado': fmt(r.completed_date),
    'Costo estimado':  fmt(r.estimated_cost),
    'Costo real':      fmt(r.actual_cost),
    'Notas':           fmt(r.notes),
    'Creada':          fmt(r.created_at?.slice(0, 10)),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(maintRows.length ? maintRows : [{ '': 'Sin datos' }]), 'Mantenimiento');

  // 6. Tickets
  const ticketRows = (tickets ?? []).map((r: any) => ({
    'N° Ticket':       fmt(r.ticket_number),
    'Fecha':           fmt(r.purchase_date),
    'Proveedor':       fmt((r.suppliers as any)?.name),
    'Registrado por':  fmt((r as any)['profiles!registered_by']?.full_name ?? (r.profiles as any)?.full_name),
    'Total':           fmt(r.total),
    'Notas':           fmt(r.notes),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ticketRows.length ? ticketRows : [{ '': 'Sin datos' }]), 'Tickets');

  // 7. Ítems de ticket
  const itemRows = (ticketItems ?? []).map((r: any) => ({
    'N° Ticket':   fmt((r.purchase_tickets as any)?.ticket_number),
    'Propiedad':   fmt((r.properties as any)?.nickname),
    'Ítem':        fmt((r.items as any)?.name),
    'Cantidad':    fmt(r.quantity),
    'P. unitario': fmt(r.unit_price),
    'Subtotal':    fmt(r.subtotal),
    'Notas':       fmt(r.notes),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itemRows.length ? itemRows : [{ '': 'Sin datos' }]), 'Ítems');

  // 8. Personal
  const profileRows = (profiles ?? []).map((r: any) => ({
    'Nombre':    fmt(r.full_name),
    'Email':     fmt(r.email),
    'Rol':       fmt(r.role),
    'Teléfono':  fmt(r.phone),
    'Activo':    r.active ? 'Sí' : 'No',
    'Creado':    fmt(r.created_at?.slice(0, 10)),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(profileRows.length ? profileRows : [{ '': 'Sin datos' }]), 'Personal');

  // 9. Asignaciones
  const assignRows = (assignments ?? []).map((r: any) => ({
    'Propiedad':    fmt((r.properties as any)?.nickname),
    'Usuario':      fmt((r as any)['profiles!user_id']?.full_name ?? (r.profiles as any)?.full_name),
    'Asignado':     fmt(r.assigned_at?.slice(0, 10)),
    'Desasignado':  fmt(r.unassigned_at?.slice(0, 10)),
    'Notas':        fmt(r.notes),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(assignRows.length ? assignRows : [{ '': 'Sin datos' }]), 'Asignaciones');

  // ── Generar buffer y responder ─────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const buffer: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="buhoops-backup-${today}.xlsx"`,
    },
  });
}
