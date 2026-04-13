'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LockKeyhole } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password') ?? '');
    const confirm  = String(form.get('confirm')  ?? '');

    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
    if (password !== confirm)  { setError('Las contraseñas no coinciden'); return; }

    setLoading(true);
    const { error: err } = await createClient().auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push('/dashboard');
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#FDFDFD] px-6">
      <div className="w-full max-w-sm space-y-8">
        <div>
          <div className="relative h-12 w-32 mb-6">
            <Image
              src="/logo.png"
              alt="Buho Property Logo"
              fill
              className="object-contain object-left"
            />
          </div>
          <h1 className="font-heading text-2xl font-black tracking-tight text-zinc-900">
            Nueva contraseña
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Elige una contraseña segura de al menos 8 caracteres.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Nueva contraseña
            </Label>
            <Input
              id="password" name="password" type="password"
              autoComplete="new-password" placeholder="••••••••"
              required minLength={8}
              className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 text-base focus-visible:ring-primary font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Confirmar contraseña
            </Label>
            <Input
              id="confirm" name="confirm" type="password"
              autoComplete="new-password" placeholder="••••••••"
              required minLength={8}
              className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 text-base focus-visible:ring-primary font-mono"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="rounded-xl bg-red-50 text-red-600 border-red-200">
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading}
            className="w-full h-14 rounded-2xl bg-zinc-900 text-white hover:bg-primary transition-all font-bold text-base shadow-lg">
            {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 text-zinc-300">
          <LockKeyhole className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-widest">Conexión Cifrada</span>
        </div>
      </div>
    </main>
  );
}
