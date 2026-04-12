import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database.generated';

/**
 * Cliente con service-role key.
 * Solo usar en Server Actions / Route Handlers — nunca en el cliente.
 * Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local (no exponer con NEXT_PUBLIC_).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están definidas en las variables de entorno.'
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
