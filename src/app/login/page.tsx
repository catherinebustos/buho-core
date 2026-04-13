import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { login } from './actions';
import { ArrowRight, LockKeyhole } from 'lucide-react';

export default function LoginPage({
  searchParams
}: {
  searchParams: { error?: string; next?: string };
}) {
  return (
    <main className="flex min-h-dvh flex-col lg:flex-row bg-[#FDFDFD]">
      {/* ── Banner Premium (Mitad Izquierda en Desktop, Cabecera en Mobile) ── */}
      <div className="relative flex flex-col justify-end w-full lg:w-1/2 min-h-[30vh] lg:min-h-dvh bg-zinc-900 overflow-hidden">
        {/* Imagen Generada */}
        <Image
          src="/images/login-banner.png"
          alt="Búho Core Headquarters"
          fill
          priority
          className="object-cover opacity-80 mix-blend-overlay"
        />
        
        {/* Degrade y Capa de Texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="relative z-10 p-8 lg:p-16">
          <div className="relative h-16 w-48 mb-6">
            <Image
              src="/logo.png"
              alt="Buho Property Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold mb-4 uppercase tracking-widest backdrop-blur-sm border border-white/10">
            Búho Core
          </div>
          <h1 className="font-heading text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
            El motor detrás <br /> de la excelencia.
          </h1>
          <p className="text-zinc-300 text-lg max-w-md font-medium">
            Trabajo en equipo en tiempo real para mantener cada propiedad impecable. <span className="italic opacity-80 font-serif">Gestión y Operaciones.</span>
          </p>
        </div>
      </div>

      {/* ── Formulario de Ingreso (Mitad Derecha) ── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <div className="relative h-12 w-32 mb-4">
              <Image
                src="/logo.png"
                alt="Buho Property Logo"
                fill
                className="object-contain object-left"
              />
            </div>
            <h2 className="font-heading text-2xl font-bold tracking-tight">Bienvenido a Búho Core</h2>
          </div>
          
          <div className="mb-10 hidden lg:block">
            <h2 className="font-heading text-3xl font-black tracking-tight text-zinc-900 mb-2">Iniciar Sesión</h2>
            <p className="text-muted-foreground text-sm font-medium">Introduce tus credenciales para acceder a la terminal.</p>
          </div>

          <form action={login} className="space-y-6">
            <input type="hidden" name="next" value={searchParams.next ?? ''} />
            
            <div className="space-y-2 relative">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Correo corporativo <span className="text-zinc-300 italic lowercase ml-1">/ email</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="ejecutivo@buhoproperty.com"
                required
                className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 text-base focus-visible:ring-primary focus-visible:bg-white transition-all"
              />
            </div>

            <div className="space-y-2 relative">
               <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Clave de acceso <span className="text-zinc-300 italic lowercase ml-1">/ password</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 text-base focus-visible:ring-primary focus-visible:bg-white transition-all font-mono"
              />
            </div>

            {searchParams.error && (
              <Alert variant="destructive" className="rounded-xl bg-red-50 text-red-600 border-red-200">
                <AlertDescription className="font-medium">{searchParams.error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-zinc-900 text-white hover:bg-primary transition-all font-bold text-lg shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              Iniciar Sesión
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-3 text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-primary hover:text-zinc-900 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <Link
              href="mailto:soporte@buhoproperty.com"
              className="font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              Contactar soporte
            </Link>
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-2 text-zinc-300">
             <LockKeyhole className="h-4 w-4" />
             <span className="text-xs font-semibold uppercase tracking-widest">Conexión Segura</span>
          </div>
        </div>
      </div>
    </main>
  );
}
