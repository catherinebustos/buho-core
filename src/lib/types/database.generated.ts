export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          id: number
          new_data: Json | null
          occurred_at: string
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          action: string
          id?: number
          new_data?: Json | null
          occurred_at?: string
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          action?: string
          id?: number
          new_data?: Json | null
          occurred_at?: string
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      canales_radio: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          frecuencia: string | null
          frecuencia_tx: string | null
          id: string
          nombre: string
          nombre_canal: string | null
          numero_canal: number | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          frecuencia?: string | null
          frecuencia_tx?: string | null
          id?: string
          nombre: string
          nombre_canal?: string | null
          numero_canal?: number | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          frecuencia?: string | null
          frecuencia_tx?: string | null
          id?: string
          nombre?: string
          nombre_canal?: string | null
          numero_canal?: number | null
        }
        Relationships: []
      }
      damage_reports: {
        Row: {
          created_at: string
          description: string
          id: string
          photo_path: string | null
          property_id: string
          reported_at: string
          reported_by: string
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["damage_status"]
          updated_at: string
          urgency: Database["public"]["Enums"]["damage_urgency"]
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          photo_path?: string | null
          property_id: string
          reported_at?: string
          reported_by: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["damage_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["damage_urgency"]
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          photo_path?: string | null
          property_id?: string
          reported_at?: string
          reported_by?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["damage_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["damage_urgency"]
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "damage_reports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_reports_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          activa: boolean | null
          created_at: string | null
          es_mandante: boolean | null
          id: string
          nombre: string
          rut: string | null
        }
        Insert: {
          activa?: boolean | null
          created_at?: string | null
          es_mandante?: boolean | null
          id?: string
          nombre: string
          rut?: string | null
        }
        Update: {
          activa?: boolean | null
          created_at?: string | null
          es_mandante?: boolean | null
          id?: string
          nombre?: string
          rut?: string | null
        }
        Relationships: []
      }
      empresas_soporte: {
        Row: {
          activa: boolean | null
          contacto_correo: string | null
          contacto_nombre: string | null
          contacto_telefono: string | null
          created_at: string | null
          especialidad: string | null
          id: string
          nombre: string
          rut: string | null
        }
        Insert: {
          activa?: boolean | null
          contacto_correo?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string | null
          especialidad?: string | null
          id?: string
          nombre: string
          rut?: string | null
        }
        Update: {
          activa?: boolean | null
          contacto_correo?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string | null
          especialidad?: string | null
          id?: string
          nombre?: string
          rut?: string | null
        }
        Relationships: []
      }
      inventario_componentes: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string
          estado_condicion: string | null
          id: string
          imagen_url: string | null
          marca: string | null
          modelo_parte: string | null
          observaciones: string | null
          stock_actual: number
          stock_minimo: number
          tipo_item: string
          unidad: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion: string
          estado_condicion?: string | null
          id?: string
          imagen_url?: string | null
          marca?: string | null
          modelo_parte?: string | null
          observaciones?: string | null
          stock_actual?: number
          stock_minimo?: number
          tipo_item: string
          unidad?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string
          estado_condicion?: string | null
          id?: string
          imagen_url?: string | null
          marca?: string | null
          modelo_parte?: string | null
          observaciones?: string | null
          stock_actual?: number
          stock_minimo?: number
          tipo_item?: string
          unidad?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      item_categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["item_category_kind"]
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["item_category_kind"]
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["item_category_kind"]
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      items: {
        Row: {
          active: boolean
          category_id: string
          created_at: string
          id: string
          name: string
          sku: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id: string
          created_at?: string
          id?: string
          name: string
          sku?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          sku?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "item_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marcas_radio: {
        Row: {
          activa: boolean | null
          id: string
          nombre: string
        }
        Insert: {
          activa?: boolean | null
          id?: string
          nombre: string
        }
        Update: {
          activa?: boolean | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      modelos_radio: {
        Row: {
          activo: boolean | null
          id: string
          marca_id: string
          nombre: string
          tipo: string
        }
        Insert: {
          activo?: boolean | null
          id?: string
          marca_id: string
          nombre: string
          tipo?: string
        }
        Update: {
          activo?: boolean | null
          id?: string
          marca_id?: string
          nombre?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "modelos_radio_marca_id_fkey"
            columns: ["marca_id"]
            isOneToOne: false
            referencedRelation: "marcas_radio"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_inventario: {
        Row: {
          cantidad: number
          created_at: string | null
          id: string
          item_id: string
          motivo: string | null
          realizado_por: string | null
          stock_anterior: number
          stock_posterior: number
          tipo_movimiento: string
          transaccion_id: string | null
        }
        Insert: {
          cantidad: number
          created_at?: string | null
          id?: string
          item_id: string
          motivo?: string | null
          realizado_por?: string | null
          stock_anterior: number
          stock_posterior: number
          tipo_movimiento: string
          transaccion_id?: string | null
        }
        Update: {
          cantidad?: number
          created_at?: string | null
          id?: string
          item_id?: string
          motivo?: string | null
          realizado_por?: string | null
          stock_anterior?: number
          stock_posterior?: number
          tipo_movimiento?: string
          transaccion_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_movimientos_transaccion"
            columns: ["transaccion_id"]
            isOneToOne: false
            referencedRelation: "transacciones_historial"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_movimientos_transaccion"
            columns: ["transaccion_id"]
            isOneToOne: false
            referencedRelation: "v_aprobaciones_pendientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_inventario_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventario_componentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_inventario_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_stock_critico"
            referencedColumns: ["id"]
          },
        ]
      }
      occupations: {
        Row: {
          checkin_date: string
          checkout_date: string
          created_at: string
          id: string
          nights: number | null
          notes: string | null
          property_id: string
          registered_by: string
          reservation_code: string
          updated_at: string
        }
        Insert: {
          checkin_date: string
          checkout_date: string
          created_at?: string
          id?: string
          nights?: number | null
          notes?: string | null
          property_id: string
          registered_by: string
          reservation_code: string
          updated_at?: string
        }
        Update: {
          checkin_date?: string
          checkout_date?: string
          created_at?: string
          id?: string
          nights?: number | null
          notes?: string | null
          property_id?: string
          registered_by?: string
          reservation_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "occupations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occupations_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parametros_sistema: {
        Row: {
          clave: string
          descripcion: string | null
          updated_at: string | null
          valor: string
        }
        Insert: {
          clave: string
          descripcion?: string | null
          updated_at?: string | null
          valor: string
        }
        Update: {
          clave?: string
          descripcion?: string | null
          updated_at?: string | null
          valor?: string
        }
        Relationships: []
      }
      perfiles_usuario: {
        Row: {
          activo: boolean | null
          created_at: string | null
          email: string | null
          id: string
          nombre_completo: string
          rol: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          email?: string | null
          id: string
          nombre_completo: string
          rol: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre_completo?: string
          rol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      personal: {
        Row: {
          activo: boolean | null
          area_departamento: string | null
          cargo: string | null
          correo: string | null
          created_at: string | null
          empresa_id: string | null
          nombre_completo: string
          rut: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          area_departamento?: string | null
          cargo?: string | null
          correo?: string | null
          created_at?: string | null
          empresa_id?: string | null
          nombre_completo: string
          rut: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          area_departamento?: string | null
          cargo?: string | null
          correo?: string | null
          created_at?: string | null
          empresa_id?: string | null
          nombre_completo?: string
          rut?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          universal_code: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          universal_code: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          universal_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          area_m2: number | null
          city: string
          country: string
          created_at: string
          created_by: string | null
          guest_capacity: number | null
          id: string
          nickname: string
          notes: string | null
          property_type_id: string | null
          qr_token: string
          status: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          area_m2?: number | null
          city: string
          country?: string
          created_at?: string
          created_by?: string | null
          guest_capacity?: number | null
          id?: string
          nickname: string
          notes?: string | null
          property_type_id?: string | null
          qr_token?: string
          status?: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          area_m2?: number | null
          city?: string
          country?: string
          created_at?: string
          created_by?: string | null
          guest_capacity?: number | null
          id?: string
          nickname?: string
          notes?: string | null
          property_type_id?: string | null
          qr_token?: string
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
      }
      property_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          notes: string | null
          property_id: string
          unassigned_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          notes?: string | null
          property_id: string
          unassigned_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          notes?: string | null
          property_id?: string
          unassigned_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          property_id: string
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          property_id: string
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          property_id?: string
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_photos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_types: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      purchase_tickets: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          purchase_date: string
          receipt_path: string | null
          registered_by: string
          supplier_id: string
          ticket_number: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date: string
          receipt_path?: string | null
          registered_by: string
          supplier_id: string
          ticket_number: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date?: string
          receipt_path?: string | null
          registered_by?: string
          supplier_id?: string
          ticket_number?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_tickets_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_tickets_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      radios: {
        Row: {
          activo: boolean | null
          asignado_a: string | null
          canal_id: string | null
          condicion: string | null
          created_at: string | null
          empresa_propietaria_id: string | null
          estado_actual: string
          fecha_adquisicion: string | null
          fecha_proximo_mantenimiento: string | null
          id: string
          marca: string | null
          modelo: string | null
          numero_serie: string | null
          observaciones: string | null
          qr_code_url: string | null
          tipo: string
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          asignado_a?: string | null
          canal_id?: string | null
          condicion?: string | null
          created_at?: string | null
          empresa_propietaria_id?: string | null
          estado_actual?: string
          fecha_adquisicion?: string | null
          fecha_proximo_mantenimiento?: string | null
          id: string
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          observaciones?: string | null
          qr_code_url?: string | null
          tipo: string
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          asignado_a?: string | null
          canal_id?: string | null
          condicion?: string | null
          created_at?: string | null
          empresa_propietaria_id?: string | null
          estado_actual?: string
          fecha_adquisicion?: string | null
          fecha_proximo_mantenimiento?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          observaciones?: string | null
          qr_code_url?: string | null
          tipo?: string
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "radios_asignado_a_fkey"
            columns: ["asignado_a"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["rut"]
          },
          {
            foreignKeyName: "radios_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canales_radio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radios_empresa_propietaria_id_fkey"
            columns: ["empresa_propietaria_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          notes: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          notes?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
        }
        Relationships: []
      }
      ticket_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          notes: string | null
          property_id: string | null
          quantity: number
          subtotal: number | null
          ticket_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          notes?: string | null
          property_id?: string | null
          quantity: number
          subtotal?: number | null
          ticket_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          notes?: string | null
          property_id?: string | null
          quantity?: number
          subtotal?: number | null
          ticket_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_items_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_items_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "purchase_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transacciones_historial: {
        Row: {
          acta_pdf_url: string | null
          aprobado_por: string | null
          comentario_aprobacion: string | null
          created_at: string | null
          detalles: Json | null
          empresa_soporte_id: string | null
          envio_soporte_id: string | null
          estado_aprobacion: string
          fecha_aprobacion: string | null
          fecha_evento: string | null
          firma_digital_url: string | null
          foto_evidencia_url: string | null
          id: string
          id_radio: string | null
          observaciones: string | null
          realizado_por: string | null
          rut_trabajador: string | null
          tipo_evento: string
          updated_at: string | null
        }
        Insert: {
          acta_pdf_url?: string | null
          aprobado_por?: string | null
          comentario_aprobacion?: string | null
          created_at?: string | null
          detalles?: Json | null
          empresa_soporte_id?: string | null
          envio_soporte_id?: string | null
          estado_aprobacion?: string
          fecha_aprobacion?: string | null
          fecha_evento?: string | null
          firma_digital_url?: string | null
          foto_evidencia_url?: string | null
          id?: string
          id_radio?: string | null
          observaciones?: string | null
          realizado_por?: string | null
          rut_trabajador?: string | null
          tipo_evento: string
          updated_at?: string | null
        }
        Update: {
          acta_pdf_url?: string | null
          aprobado_por?: string | null
          comentario_aprobacion?: string | null
          created_at?: string | null
          detalles?: Json | null
          empresa_soporte_id?: string | null
          envio_soporte_id?: string | null
          estado_aprobacion?: string
          fecha_aprobacion?: string | null
          fecha_evento?: string | null
          firma_digital_url?: string | null
          foto_evidencia_url?: string | null
          id?: string
          id_radio?: string | null
          observaciones?: string | null
          realizado_por?: string | null
          rut_trabajador?: string | null
          tipo_evento?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transacciones_historial_empresa_soporte_id_fkey"
            columns: ["empresa_soporte_id"]
            isOneToOne: false
            referencedRelation: "empresas_soporte"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_historial_envio_soporte_id_fkey"
            columns: ["envio_soporte_id"]
            isOneToOne: false
            referencedRelation: "transacciones_historial"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_historial_envio_soporte_id_fkey"
            columns: ["envio_soporte_id"]
            isOneToOne: false
            referencedRelation: "v_aprobaciones_pendientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_historial_id_radio_fkey"
            columns: ["id_radio"]
            isOneToOne: false
            referencedRelation: "radios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_historial_id_radio_fkey"
            columns: ["id_radio"]
            isOneToOne: false
            referencedRelation: "v_radios_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_historial_rut_trabajador_fkey"
            columns: ["rut_trabajador"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["rut"]
          },
        ]
      }
      visit_items_used: {
        Row: {
          created_at: string
          id: string
          item_id: string
          notes: string | null
          quantity: number
          visit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          notes?: string | null
          quantity: number
          visit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          notes?: string | null
          quantity?: number
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_items_used_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_items_used_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          stage: string | null
          storage_path: string
          uploaded_by: string | null
          visit_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          stage?: string | null
          storage_path: string
          uploaded_by?: string | null
          visit_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          stage?: string | null
          storage_path?: string
          uploaded_by?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_photos_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_types: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      visits: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          performed_by: string
          property_id: string
          updated_at: string
          via_qr: boolean
          visit_at: string
          visit_type_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          performed_by: string
          property_id: string
          updated_at?: string
          via_qr?: boolean
          visit_at?: string
          visit_type_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          performed_by?: string
          property_id?: string
          updated_at?: string
          via_qr?: boolean
          visit_at?: string
          visit_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_visit_type_id_fkey"
            columns: ["visit_type_id"]
            isOneToOne: false
            referencedRelation: "visit_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_aprobaciones_pendientes: {
        Row: {
          created_at: string | null
          detalles: Json | null
          empresa_soporte_id: string | null
          empresa_soporte_nombre: string | null
          estado_aprobacion: string | null
          fecha_evento: string | null
          foto_evidencia_url: string | null
          id: string | null
          id_radio: string | null
          observaciones: string | null
          radio_estado: string | null
          radio_marca: string | null
          radio_modelo: string | null
          realizado_por: string | null
          rut_trabajador: string | null
          tecnico_nombre: string | null
          tipo_evento: string | null
          trabajador_nombre: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transacciones_historial_empresa_soporte_id_fkey"
            columns: ["empresa_soporte_id"]
            isOneToOne: false
            referencedRelation: "empresas_soporte"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_historial_id_radio_fkey"
            columns: ["id_radio"]
            isOneToOne: false
            referencedRelation: "radios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_historial_id_radio_fkey"
            columns: ["id_radio"]
            isOneToOne: false
            referencedRelation: "v_radios_completas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_historial_rut_trabajador_fkey"
            columns: ["rut_trabajador"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["rut"]
          },
        ]
      }
      v_kpis_dashboard: {
        Row: {
          asignadas: number | null
          con_mantenimiento_vencido: number | null
          dadas_de_baja: number | null
          disponibles: number | null
          en_soporte_externo: number | null
          en_taller: number | null
          instaladas: number | null
          perdidas_robadas: number | null
          proximas_a_mantenimiento: number | null
          total_radios: number | null
        }
        Relationships: []
      }
      v_property_month_kpis: {
        Row: {
          cleanings_count: number | null
          cleanings_per_occupation: number | null
          month: string | null
          nights_count: number | null
          occupations_count: number | null
          property_id: string | null
        }
        Relationships: []
      }
      v_radios_completas: {
        Row: {
          asignado_a: string | null
          canal_frecuencia: string | null
          canal_id: string | null
          canal_nombre: string | null
          condicion: string | null
          created_at: string | null
          empresa_nombre: string | null
          empresa_propietaria_id: string | null
          estado_actual: string | null
          fecha_adquisicion: string | null
          fecha_proximo_mantenimiento: string | null
          id: string | null
          marca: string | null
          modelo: string | null
          numero_serie: string | null
          observaciones: string | null
          qr_code_url: string | null
          responsable_area: string | null
          responsable_cargo: string | null
          responsable_nombre: string | null
          tipo: string | null
          ubicacion: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "radios_asignado_a_fkey"
            columns: ["asignado_a"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["rut"]
          },
          {
            foreignKeyName: "radios_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canales_radio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "radios_empresa_propietaria_id_fkey"
            columns: ["empresa_propietaria_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      v_stock_critico: {
        Row: {
          created_at: string | null
          descripcion: string | null
          diferencia_stock: number | null
          estado_condicion: string | null
          id: string | null
          marca: string | null
          modelo_parte: string | null
          nivel_alerta: string | null
          stock_actual: number | null
          stock_minimo: number | null
          tipo_item: string | null
          unidad: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          diferencia_stock?: never
          estado_condicion?: string | null
          id?: string | null
          marca?: string | null
          modelo_parte?: string | null
          nivel_alerta?: never
          stock_actual?: number | null
          stock_minimo?: number | null
          tipo_item?: string | null
          unidad?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          diferencia_stock?: never
          estado_condicion?: string | null
          id?: string | null
          marca?: string | null
          modelo_parte?: string | null
          nivel_alerta?: never
          stock_actual?: number | null
          stock_minimo?: number | null
          tipo_item?: string | null
          unidad?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      fn_current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      fn_has_property_access: { Args: { p_property: string }; Returns: boolean }
      fn_is_admin_or_higher: { Args: never; Returns: boolean }
      fn_is_super_admin: { Args: never; Returns: boolean }
      fn_is_supervisor_or_higher: { Args: never; Returns: boolean }
      get_user_rol: { Args: never; Returns: string }
    }
    Enums: {
      damage_status: "pendiente" | "en_proceso" | "resuelto" | "descartado"
      damage_urgency: "baja" | "media" | "alta"
      item_category_kind: "consumible" | "esporadico"
      property_status: "activa" | "inactiva"
      user_role: "super_admin" | "admin" | "supervisor" | "maintenance" | "cleaner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      damage_status: ["pendiente", "en_proceso", "resuelto", "descartado"],
      damage_urgency: ["baja", "media", "alta"],
      item_category_kind: ["consumible", "esporadico"],
      property_status: ["activa", "inactiva"],
      user_role: ["super_admin", "admin", "supervisor", "maintenance", "cleaner"],
    },
  },
} as const
