/**
 * Tipos del esquema BúhoOps escritos a mano.
 * Una vez conectes con Supabase, regenera con:
 *   supabase gen types typescript --project-id <id> --schema public > src/lib/types/database.generated.ts
 * y cambia el import de @/lib/types/database por @/lib/types/database.generated.
 */

export type UserRole = 'super_admin' | 'admin' | 'supervisor' | 'maintenance' | 'cleaner';
export type MaintenanceCategory = 'electricidad' | 'gasfiteria' | 'carpinteria' | 'pintura' | 'cerrajeria' | 'jardineria' | 'estructural' | 'climatizacion' | 'limpieza_especial' | 'otro';
export type MaintenanceStatus = 'pendiente' | 'presupuestado' | 'aprobado' | 'en_proceso' | 'completado' | 'cancelado';
export type ItemKind = 'consumible' | 'esporadico';
export type PropertyStatus = 'activa' | 'inactiva';
export type DamageUrgency = 'baja' | 'media' | 'alta';
export type DamageStatus = 'pendiente' | 'en_proceso' | 'resuelto' | 'descartado';

export interface Profile {
  id: string;
  universal_code: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyType {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface ItemCategory {
  id: string;
  name: string;
  kind: ItemKind;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  category_id: string;
  unit: string;
  sku: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface VisitType {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface Property {
  id: string;
  nickname: string;
  title: string;
  property_type_id: string | null;
  country: string;
  city: string;
  address: string | null;
  area_m2: number | null;
  guest_capacity: number | null;
  status: PropertyStatus;
  qr_token: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyAssignment {
  id: string;
  property_id: string;
  user_id: string;
  assigned_at: string;
  unassigned_at: string | null;
  assigned_by: string | null;
  notes: string | null;
}

export interface Visit {
  id: string;
  property_id: string;
  visit_type_id: string;
  visit_at: string;
  performed_by: string;
  via_qr: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitItemUsed {
  id: string;
  visit_id: string;
  item_id: string;
  quantity: number;
  notes: string | null;
  created_at: string;
}

export interface DamageReport {
  id: string;
  visit_id: string | null;
  property_id: string;
  description: string;
  urgency: DamageUrgency;
  status: DamageStatus;
  photo_path: string | null;
  reported_by: string;
  reported_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Occupation {
  id: string;
  property_id: string;
  reservation_code: string;
  checkin_date: string;
  checkout_date: string;
  nights: number;
  notes: string | null;
  registered_by: string;
  created_at: string;
  updated_at: string;
}

// ── Mantenimiento ─────────────────────────────────────────────────────
export interface MaintenanceRequest {
  id: string;
  created_at: string;
  updated_at: string;
  property_id: string;
  title: string;
  description: string | null;
  category: MaintenanceCategory;
  status: MaintenanceStatus;
  urgency: 'baja' | 'media' | 'alta';
  reported_by: string | null;
  assigned_to: string | null;
  scheduled_date: string | null;
  completed_date: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  damage_report_id: string | null;
  notes: string | null;
}

// ── Notificaciones ─────────────────────────────────────────────────
export interface Notification {
  id: string;
  created_at: string;
  actor_id: string | null;
  actor_name: string | null;
  event_type: string;
  entity_type: string;
  entity_id: string;
  property_id: string | null;
  property_nickname: string | null;
  title: string;
  body: string | null;
  target_roles: string[];
  target_user_ids: string[];
}

export interface NotificationRead {
  notification_id: string;
  user_id: string;
  read_at: string;
}

export interface MyNotification extends Notification {
  is_read: boolean;
  read_at: string | null;
}

// ── Tablas adicionales (Fase 2-3) ───────────────────────────────────
export interface PurchaseTicket {
  id: string;
  ticket_number: string;
  purchase_date: string;
  supplier_id: string;
  registered_by: string;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketItem {
  id: string;
  ticket_id: string;
  item_id: string;
  property_id: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes: string | null;
  created_at: string;
}

export interface PropertyPhoto {
  id: string;
  property_id: string;
  storage_path: string;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface VisitPhoto {
  id: string;
  visit_id: string;
  storage_path: string;
  stage: 'antes' | 'durante' | 'despues' | 'otro';
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface AuditLog {
  id: number;
  occurred_at: string;
  user_id: string | null;
  user_role: UserRole | null;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
}

export interface PropertyMonthKpi {
  property_id: string;
  month: string;
  occupations_count: number;
  nights_count: number;
  cleanings_count: number;
  cleanings_per_occupation: number | null;
}

// ---------- Tipo mínimo compatible con @supabase/ssr generics ----------
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & Pick<Profile, 'id' | 'full_name' | 'email' | 'universal_code'>; Update: Partial<Profile> };
      property_types: { Row: PropertyType; Insert: Partial<PropertyType> & Pick<PropertyType, 'name'>; Update: Partial<PropertyType> };
      item_categories: { Row: ItemCategory; Insert: Partial<ItemCategory> & Pick<ItemCategory, 'name' | 'kind'>; Update: Partial<ItemCategory> };
      items: { Row: Item; Insert: Partial<Item> & Pick<Item, 'name' | 'category_id'>; Update: Partial<Item> };
      suppliers: { Row: Supplier; Insert: Partial<Supplier> & Pick<Supplier, 'name'>; Update: Partial<Supplier> };
      visit_types: { Row: VisitType; Insert: Partial<VisitType> & Pick<VisitType, 'name'>; Update: Partial<VisitType> };
      properties: { Row: Property; Insert: Partial<Property> & Pick<Property, 'nickname' | 'title' | 'city'>; Update: Partial<Property> };
      property_assignments: { Row: PropertyAssignment; Insert: Partial<PropertyAssignment> & Pick<PropertyAssignment, 'property_id' | 'user_id'>; Update: Partial<PropertyAssignment> };
      property_photos: { Row: PropertyPhoto; Insert: Partial<PropertyPhoto> & Pick<PropertyPhoto, 'property_id' | 'storage_path'>; Update: Partial<PropertyPhoto> };
      purchase_tickets: { Row: PurchaseTicket; Insert: Partial<PurchaseTicket> & Pick<PurchaseTicket, 'ticket_number' | 'purchase_date' | 'supplier_id' | 'registered_by'>; Update: Partial<PurchaseTicket> };
      ticket_items: { Row: TicketItem; Insert: Partial<TicketItem> & Pick<TicketItem, 'ticket_id' | 'item_id' | 'quantity' | 'unit_price'>; Update: Partial<TicketItem> };
      visits: { Row: Visit; Insert: Partial<Visit> & Pick<Visit, 'property_id' | 'visit_type_id' | 'performed_by'>; Update: Partial<Visit> };
      visit_items_used: { Row: VisitItemUsed; Insert: Partial<VisitItemUsed> & Pick<VisitItemUsed, 'visit_id' | 'item_id' | 'quantity'>; Update: Partial<VisitItemUsed> };
      visit_photos: { Row: VisitPhoto; Insert: Partial<VisitPhoto> & Pick<VisitPhoto, 'visit_id' | 'storage_path'>; Update: Partial<VisitPhoto> };
      damage_reports: { Row: DamageReport; Insert: Partial<DamageReport> & Pick<DamageReport, 'property_id' | 'description' | 'reported_by'>; Update: Partial<DamageReport> };
      occupations: { Row: Occupation; Insert: Partial<Occupation> & Pick<Occupation, 'property_id' | 'reservation_code' | 'checkin_date' | 'checkout_date' | 'registered_by'>; Update: Partial<Occupation> };
      audit_log: { Row: AuditLog; Insert: never; Update: never };
    };
    Views: {
      v_property_month_kpis: { Row: PropertyMonthKpi };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      item_category_kind: ItemKind;
      property_status: PropertyStatus;
      damage_urgency: DamageUrgency;
      damage_status: DamageStatus;
    };
  };
};
