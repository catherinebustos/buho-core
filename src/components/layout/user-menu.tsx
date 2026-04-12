import { LogOut } from 'lucide-react';
import { logout } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { ROLE_LABELS } from '@/lib/constants';
import type { Tables } from '@/lib/types/database.generated';
type Profile = Tables<'profiles'>;

export function UserMenu({ profile }: { profile: Profile }) {
  const initials = profile.full_name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end justify-center">
        <p className="text-sm font-bold font-heading text-zinc-900 leading-none mb-1">{profile.full_name}</p>
        <p className="text-[10px] uppercase tracking-wider font-bold text-primary">{ROLE_LABELS[profile.role]}</p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-zinc-100 text-sm font-bold text-zinc-700 font-heading">
        {initials}
      </div>
      <div className="w-px h-6 bg-zinc-200"></div>
      <form action={logout}>
        <button
          type="submit"
          className="flex h-10 w-10 items-center justify-center rounded-[1rem] text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
