import type { UserRole } from '@/lib/types/database.generated';

export const PREVIEW_COOKIE = 'buhoops_preview_role';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrador',
  admin: 'Administrador',
  supervisor: 'Supervisor',
  maintenance: 'Personal de Mantenimiento',
  cleaner: 'Personal de Limpieza'
};

export const ROLE_RANK: Record<UserRole, number> = {
  cleaner: 1,
  maintenance: 2,
  supervisor: 3,
  admin: 4,
  super_admin: 5
};
