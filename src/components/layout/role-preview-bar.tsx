'use client';

import { usePathname } from 'next/navigation';
import { Eye, X } from 'lucide-react';
import { setPreviewRole } from '@/app/(app)/preview-role/actions';
import { ROLE_LABELS } from '@/lib/constants';
import type { UserRole } from '@/lib/types/database';

const ROLES: UserRole[] = ['cleaner', 'supervisor', 'admin', 'super_admin'];

interface RolePreviewBarProps {
  currentPreviewRole: UserRole | null;
}

const SHORT_ROLES: Record<UserRole, string> = {
  cleaner: 'Limpieza',
  supervisor: 'Supervisor',
  admin: 'Admin',
  super_admin: 'Super Admin'
};

export function RolePreviewBar({ currentPreviewRole }: RolePreviewBarProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex w-[95vw] max-w-fit items-center shadow-2xl rounded-full bg-[#111111] p-1 border border-white/10 backdrop-blur-xl">
      <span className="hidden md:flex flex-shrink-0 items-center gap-1.5 px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 font-heading">
        <Eye className="h-4 w-4 text-primary" />
        Simular:
      </span>

      <div className="flex w-full overflow-x-auto no-scrollbar items-center">
        <form action={setPreviewRole} className="flex items-center gap-1">
          <input type="hidden" name="referer" value={pathname} />
          {ROLES.map((role) => {
            const isActive = currentPreviewRole === role || (!currentPreviewRole && role === 'super_admin');
            return (
              <button
                key={role}
                type="submit"
                name="role"
                value={role}
                className={`rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-300 font-heading ${
                  isActive
                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(253,106,59,0.3)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {SHORT_ROLES[role]}
              </button>
            );
          })}
        </form>

        {currentPreviewRole && (
          <form action={setPreviewRole} className="ml-1 pl-1 border-l border-white/10 flex-shrink-0">
            <input type="hidden" name="referer" value={pathname} />
            <button
              type="submit"
              name="role"
              value="super_admin"
              className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-[10px] sm:text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all font-heading"
              title="Salir de vista previa"
            >
              <X className="h-3 w-3" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
