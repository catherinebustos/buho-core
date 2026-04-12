'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types/database';
import { PREVIEW_COOKIE } from '@/lib/constants';

const VALID_ROLES: UserRole[] = ['super_admin', 'admin', 'supervisor', 'cleaner'];

export async function setPreviewRole(formData: FormData) {
  // Solo super_admin puede usar esto
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'super_admin') redirect('/dashboard');

  const role = String(formData.get('role') ?? '') as UserRole;
  const referer = String(formData.get('referer') ?? '/dashboard');

  if (!VALID_ROLES.includes(role)) redirect(referer);

  const cookieStore = cookies();
  if (role === 'super_admin') {
    // Quitar preview → volver a rol real
    cookieStore.delete(PREVIEW_COOKIE);
  } else {
    cookieStore.set(PREVIEW_COOKIE, role, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      // Sin expires → sesión (se borra al cerrar el browser)
    });
  }

  redirect(referer);
}
