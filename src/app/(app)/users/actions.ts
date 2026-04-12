'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types/database';

const VALID_ROLES: UserRole[] = ['super_admin', 'admin', 'supervisor', 'cleaner'];

function generateUniversalCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createUser(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user: me }
  } = await supabase.auth.getUser();
  if (!me) redirect('/login');

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const full_name = String(formData.get('full_name') ?? '').trim();
  const role = String(formData.get('role') ?? '') as UserRole;
  const phone = String(formData.get('phone') ?? '').trim() || null;
  const password = String(formData.get('password') ?? '').trim();

  if (!email || !full_name || !VALID_ROLES.includes(role)) {
    redirect('/users/new?error=' + encodeURIComponent('Email, nombre y rol son requeridos'));
  }
  if (password.length < 8) {
    redirect('/users/new?error=' + encodeURIComponent('La contraseña debe tener al menos 8 caracteres'));
  }

  const admin = createAdminClient();

  // Crear usuario en auth
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name }
  });

  if (authError || !authUser.user) {
    redirect('/users/new?error=' + encodeURIComponent(authError?.message ?? 'Error al crear usuario auth'));
  }

  // Crear perfil en profiles (el trigger debería hacerlo automáticamente, pero lo forzamos)
  const universal_code = generateUniversalCode();
  const { error: profileError } = await admin.from('profiles').upsert({
    id: authUser.user.id,
    email,
    full_name,
    role,
    phone,
    universal_code,
    active: true
  });

  if (profileError) {
    // Rollback auth user
    await admin.auth.admin.deleteUser(authUser.user.id);
    redirect('/users/new?error=' + encodeURIComponent(profileError.message));
  }

  revalidatePath('/users');
  redirect('/users');
}

export async function updateUser(userId: string, formData: FormData) {
  const full_name = String(formData.get('full_name') ?? '').trim();
  const role = String(formData.get('role') ?? '') as UserRole;
  const phone = String(formData.get('phone') ?? '').trim() || null;

  if (!full_name || !VALID_ROLES.includes(role)) {
    redirect(`/users/${userId}/edit?error=` + encodeURIComponent('Nombre y rol son requeridos'));
  }

  const admin = createAdminClient();

  const { error } = await admin.from('profiles').update({ full_name, role, phone }).eq('id', userId);
  if (error) {
    redirect(`/users/${userId}/edit?error=` + encodeURIComponent(error.message));
  }

  revalidatePath('/users');
  redirect('/users');
}

export async function toggleUserActive(formData: FormData) {
  const userId = String(formData.get('user_id') ?? '');
  const active = formData.get('active') === 'true';

  if (!userId) return;

  const admin = createAdminClient();
  const { error } = await admin.from('profiles').update({ active }).eq('id', userId);
  if (error) {
    redirect('/users?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/users');
  redirect('/users');
}

export async function resetUserPassword(formData: FormData) {
  const userId = String(formData.get('user_id') ?? '');
  const password = String(formData.get('password') ?? '').trim();

  if (!userId || password.length < 8) {
    redirect('/users?error=' + encodeURIComponent('Contraseña inválida (mínimo 8 caracteres)'));
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) {
    redirect('/users?error=' + encodeURIComponent(error.message));
  }

  revalidatePath('/users');
  redirect('/users');
}
