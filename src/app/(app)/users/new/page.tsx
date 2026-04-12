import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, ArrowRight, X } from 'lucide-react';
import { createUser } from '../actions';

export default async function NewUserPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  await requireRole('admin');

  // Clases compartidas para el diseño "Burbuja Absolute Clean"
  const inputElClasses = "h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 text-base focus-visible:ring-blue-500 focus-visible:bg-white transition-all shadow-sm";
  const labelClasses = "text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 ml-1 block";

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500 pb-24">
      {/* ── Encabezado Burbuja ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold mb-3 uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" />
            Integración de Personal
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-zinc-900">
            Nuevo Operador
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Da de alta una nueva cuenta operativa o administrativa en Búho Core.
          </p>
        </div>
      </div>

      {searchParams.error ? (
        <Alert variant="destructive" className="rounded-2xl bg-red-50 text-red-600 border-red-200">
          <AlertDescription className="font-bold">{searchParams.error}</AlertDescription>
        </Alert>
      ) : null}

      {/* ── Formulario Wrapper ── */}
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
        <h2 className="font-heading text-xl font-bold text-zinc-900 mb-8 pb-4 border-b border-zinc-100">
          Credenciales y Asignación
        </h2>
        
        <form action={createUser} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1 relative group md:col-span-2">
              <Label htmlFor="full_name" className={labelClasses}>Nombre completo *</Label>
              <Input id="full_name" name="full_name" required className={inputElClasses} />
            </div>

            <div className="space-y-1 relative group">
              <Label htmlFor="email" className={labelClasses}>Correo Electrónico (Login) *</Label>
              <Input id="email" name="email" type="email" required className={inputElClasses} />
            </div>

            <div className="space-y-1 relative group">
              <Label htmlFor="phone" className={labelClasses}>Teléfono Móvil</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+56 9 XXXX XXXX" className={inputElClasses} />
            </div>

            <div className="space-y-1 relative group">
              <Label htmlFor="role" className={labelClasses}>Rol Operativo *</Label>
              <select 
                id="role" 
                name="role" 
                required 
                defaultValue="cleaner"
                className={`w-full appearance-none cursor-pointer border focus:outline-none focus:ring-blue-500 ${inputElClasses}`}
              >
                <option value="cleaner">Personal de Limpieza</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
                <option value="super_admin">Super Administrador</option>
              </select>
            </div>

            <div className="space-y-1 relative group">
              <Label htmlFor="password" className={labelClasses}>Contraseña inicial *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
                placeholder="Mínimo 8 caracteres"
                className={inputElClasses}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 pt-6 border-t border-zinc-100">
            <Link href="/users" className="w-full md:w-auto">
              <Button type="button" variant="outline" className="w-full md:w-auto h-14 px-8 rounded-2xl font-bold bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 transition-all">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="w-full md:w-auto h-14 px-10 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5">
              Habilitar Acceso
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
