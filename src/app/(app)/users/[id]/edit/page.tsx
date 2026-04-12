import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, ArrowRight, X, KeySquare } from 'lucide-react';
import { updateUser, resetUserPassword } from '../../actions';
import type { Profile } from '@/lib/types/database.generated';

export default async function EditUserPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  await requireRole('admin');
  const supabase = createClient();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!data) notFound();
  const profile = data as Profile;

  const update = updateUser.bind(null, params.id);

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
            {profile.universal_code}
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-zinc-900">
            Actualizar Operador
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Modifica los privilegios o datos de contacto de este usuario en la organización.
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
        
        <form action={update} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1 relative group md:col-span-2">
              <Label htmlFor="full_name" className={labelClasses}>Nombre completo *</Label>
              <Input id="full_name" name="full_name" defaultValue={profile.full_name} required className={inputElClasses} />
            </div>

            <div className="space-y-1 relative group">
              <Label className={labelClasses}>Correo Electrónico (Login)</Label>
              <Input value={profile.email} disabled className={`opacity-60 cursor-not-allowed ${inputElClasses}`} />
            </div>

            <div className="space-y-1 relative group">
              <Label htmlFor="phone" className={labelClasses}>Teléfono Móvil</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile.phone ?? ''}
                placeholder="+56 9 XXXX XXXX"
                className={inputElClasses}
              />
            </div>

            <div className="space-y-1 relative group md:col-span-2">
              <Label htmlFor="role" className={labelClasses}>Rol Operativo *</Label>
              <select 
                id="role" 
                name="role" 
                required 
                defaultValue={profile.role}
                className={`w-full appearance-none cursor-pointer border focus:outline-none focus:ring-blue-500 ${inputElClasses}`}
              >
                <option value="cleaner">Personal de Limpieza</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
                <option value="super_admin">Super Administrador</option>
              </select>
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
              Guardar Modificaciones
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>

      {/* ── Cambio de Contraseña ── */}
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-100">
         <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-50">
            <div className="p-2 bg-red-50 rounded-xl text-red-600">
                <KeySquare className="w-6 h-6" />
            </div>
            <div>
                <h2 className="font-heading text-lg font-bold text-red-600">Gestión de Acceso</h2>
                <p className="text-sm font-medium text-red-500/80">Forzar cambio de clave para este usuario.</p>
            </div>
        </div>

        <form action={resetUserPassword} className="flex flex-col md:flex-row items-end gap-4">
          <input type="hidden" name="user_id" value={profile.id} />
          
          <div className="flex-1 w-full space-y-1 relative group">
            <Label htmlFor="password" className={labelClasses}>Nueva contraseña *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              placeholder="Escribe la nueva clave segura..."
              className={`${inputElClasses} border-red-100 focus-visible:ring-red-500`}
            />
          </div>
          
          <Button type="submit" className="w-full md:w-auto h-14 px-8 rounded-2xl font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 transition-all">
            Validar Reset
          </Button>
        </form>
      </div>
    </div>
  );
}
