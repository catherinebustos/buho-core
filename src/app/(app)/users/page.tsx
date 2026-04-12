import Link from 'next/link';
import { Plus, Users, Shield, AtSign, Calendar, Settings2, ShieldAlert } from 'lucide-react';
import { requireRole, ROLE_LABELS } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { toggleUserActive } from './actions';
import type { Profile, UserRole } from '@/lib/types/database';

export default async function UsersListPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  await requireRole('admin');
  const supabase = createClient();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true });

  const rows = (data ?? []) as Profile[];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* ── Encabezado ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold mb-3 uppercase tracking-widest">
            <ShieldAlert className="w-3.5 h-3.5" />
            Acceso & Seguridad
          </div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-zinc-900">
            Fuerza Operativa
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Gestión de equipo, accesos y asignación de roles.
          </p>
        </div>
        <Link href="/users/new">
          <Button className="h-12 px-6 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-primary hover:-translate-y-1 transition-all shadow-lg hover:shadow-primary/25">
            <Plus className="mr-2 h-5 w-5" />
            New User
          </Button>
        </Link>
      </div>

      {searchParams.error ? (
        <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50 text-red-600">
          <AlertDescription className="font-bold">{searchParams.error}</AlertDescription>
        </Alert>
      ) : null}

      {/* ── Grid de Usuarios ── */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-12">
          <EmptyState
            icon={<Users className="h-12 w-12 text-zinc-300" />}
            title="Sin Personal Registrado"
            description="Comienza creando la primera cuenta operativa en el sistema."
            action={
              <Link href="/users/new">
                <Button className="mt-4 rounded-xl font-bold">Crear Integrante</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rows.map((u) => (
            <div key={u.id} className="group flex flex-col bg-white p-6 rounded-3xl border border-zinc-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden">
              
              {/* Barra de Estado Visual */}
              <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors ${u.active ? 'bg-primary' : 'bg-red-500'}`} />

              <div className="flex justify-between items-start mb-4 mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center font-heading font-black text-xl">
                    {u.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-black text-zinc-900 leading-none mb-1">
                      {u.full_name}
                    </h3>
                    <span className="font-mono text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-md">
                      {u.universal_code || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 bg-zinc-50/50 p-2 rounded-xl">
                  <AtSign className="w-4 h-4 text-zinc-400" />
                  <span className="truncate">{u.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 bg-zinc-50/50 p-2 rounded-xl">
                  <Shield className="w-4 h-4 text-zinc-400" />
                  <span>{ROLE_LABELS[u.role as UserRole]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 bg-zinc-50/50 p-2 rounded-xl">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span>Alta: {formatDate(u.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                <form action={toggleUserActive}>
                  <input type="hidden" name="user_id" value={u.id} />
                  <input type="hidden" name="active" value={String(!u.active)} />
                  <button type="submit" className="outline-none focus:ring-2 focus:ring-primary rounded-lg transition-all">
                    {u.active ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider hover:bg-red-50 hover:text-red-700 group/btn">
                        <span className="group-hover/btn:hidden">Activo</span>
                        <span className="hidden group-hover/btn:block">Desactivar</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-500 text-xs font-bold uppercase tracking-wider hover:bg-green-50 hover:text-green-700 group/btn">
                         <span className="group-hover/btn:hidden">Inactivo</span>
                         <span className="hidden group-hover/btn:block">Activar</span>
                      </span>
                    )}
                  </button>
                </form>

                <Link href={`/users/${u.id}/edit`}>
                  <Button variant="ghost" size="sm" className="rounded-xl font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
                    <Settings2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
