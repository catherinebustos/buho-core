'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '') || '/dashboard';

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent('Correo y contraseña son requeridos')}`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent('Credenciales inválidas')}`);
  }

  revalidatePath('/', 'layout');
  redirect(next);
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) redirect('/forgot-password?error=Ingresa+tu+correo');

  const supabase = createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:1111';
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/reset-password`
  });
  // Siempre redirigimos con éxito para no revelar si el email existe
  redirect('/forgot-password?sent=1');
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) {
    redirect('/reset-password?error=La+contrase%C3%B1a+debe+tener+al+menos+8+caracteres');
  }
  if (password !== confirm) {
    redirect('/reset-password?error=Las+contrase%C3%B1as+no+coinciden');
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }
  redirect('/dashboard');
}
