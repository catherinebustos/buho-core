import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile, UserRole } from '@/lib/types/database';
import { PREVIEW_COOKIE, ROLE_LABELS, ROLE_RANK } from '@/lib/constants';

export { PREVIEW_COOKIE, ROLE_LABELS };

export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const profile = (data as Profile | null) ?? null;
  if (!profile) return null;

  // Super admin puede previsualizar otros roles (solo UI, no RLS)
  if (profile.role === 'super_admin') {
    const cookieStore = cookies();
    const previewRole = cookieStore.get(PREVIEW_COOKIE)?.value as UserRole | undefined;
    if (previewRole && previewRole !== 'super_admin') {
      return { ...profile, role: previewRole, _realRole: 'super_admin' } as Profile & {
        _realRole: UserRole;
      };
    }
  }

  return profile;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) redirect('/login');
  return profile;
}

export function hasRoleAtLeast(role: UserRole, min: UserRole) {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

export async function requireRole(min: UserRole): Promise<Profile> {
  const profile = await requireProfile();
  if (!hasRoleAtLeast(profile.role, min)) redirect('/dashboard');
  return profile;
}
