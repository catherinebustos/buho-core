import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { requestPasswordReset } from '@/app/login/actions';

export default function ForgotPasswordPage({
  searchParams
}: {
  searchParams: { error?: string; sent?: string };
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#FDFDFD] px-6 py-12">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-white shadow-xl">
          B
        </div>

        {searchParams.sent ? (
          /* ── Estado: email enviado ─────────────────────────────── */
          <div className="space-y-6">
            <div className="text-5xl">📬</div>

            <div>
              <h1 className="font-heading text-2xl font-black tracking-tight text-zinc-900">
                ¡Andamo'!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                El mail ya va en camino. Mirá tu bandeja de entrada — no tarda.
              </p>
            </div>

            {/* Instrucciones paso a paso */}
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Seguí estos pasos
              </p>

              <div className="space-y-3">
                <Step n="1" emoji="📧">
                  Buscá un mail de{' '}
                  <span className="font-mono text-xs bg-white border border-zinc-200 rounded px-1.5 py-0.5 text-zinc-700">
                    noreply@mail.app.supabase.io
                  </span>
                </Step>

                <Step n="2" emoji="🔍">
                  El asunto es{' '}
                  <span className="font-semibold text-zinc-800">"Reset Your Password"</span>
                  {' '}— buscalo así nomás.
                </Step>

                <Step n="3" emoji="🖱️">
                  Apretá el botón{' '}
                  <span className="inline-block rounded-md bg-zinc-900 px-2 py-0.5 text-xs font-bold text-white">
                    Reset Password
                  </span>
                  {' '}que viene adentro del mail.
                </Step>

                <Step n="4" emoji="🔐">
                  Elegí una contraseña nueva y listo — entrás directo al sistema.
                </Step>
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <span className="font-bold">¿No llega?</span>{' '}
              Revisá spam. Si en 5 minutos no apareció, volvé atrás e intentá de nuevo.
              A veces los servidores se toman un cafecito. ☕
            </div>

            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>

        ) : (
          /* ── Estado: formulario ────────────────────────────────── */
          <div className="space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-black tracking-tight text-zinc-900">
                ¿Se te fue la mano con la contraseña?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Tranqui, le pasa a los mejores. Ingresá tu correo y te mandamos
                un link para que elijas una nueva.
              </p>
            </div>

            <form action={requestPasswordReset} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Tu correo electrónico
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@buhoproperty.com"
                  required
                  className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 text-base focus-visible:ring-primary"
                />
              </div>

              {searchParams.error && (
                <Alert variant="destructive" className="rounded-xl bg-red-50 text-red-600 border-red-200">
                  <AlertDescription className="font-medium">{searchParams.error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-zinc-900 text-white hover:bg-primary transition-all font-bold text-base shadow-lg"
              >
                Mandarme el link 🚀
              </Button>
            </form>

            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function Step({
  n,
  emoji,
  children
}: {
  n: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
        {n}
      </div>
      <p className="text-sm text-zinc-600 leading-snug">
        <span className="mr-1">{emoji}</span>
        {children}
      </p>
    </div>
  );
}
