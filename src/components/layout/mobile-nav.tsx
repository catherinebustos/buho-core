'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  ClipboardList,
  Receipt,
  AlertTriangle,
  BookOpen,
  Users,
  CalendarCheck,
  BarChart3,
  ShieldCheck,
  Wrench,
  Download,
  Home,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/login/actions';
import { ROLE_LABELS } from '@/lib/constants';
import type { UserRole } from '@/lib/types/database';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  cleaner: [
    { href: '/dashboard',      label: 'Mi Turno',         icon: LayoutDashboard },
    { href: '/my-properties',  label: 'Mis Propiedades',  icon: Home },
    { href: '/visits/new',     label: 'Nuevo Check-list', icon: ClipboardList },
    { href: '/visits',         label: 'Mis Check-lists',  icon: ClipboardList },
    { href: '/damages',        label: 'Daños',            icon: AlertTriangle },
  ],
  maintenance: [
    { href: '/dashboard',      label: 'Mi Turno',         icon: LayoutDashboard },
    { href: '/my-properties',  label: 'Mis Propiedades',  icon: Home },
    { href: '/maintenance',    label: 'Mantenimiento',    icon: Wrench },
    { href: '/damages',        label: 'Daños',            icon: AlertTriangle },
  ],
  supervisor: [
    { href: '/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
    { href: '/properties',     label: 'Propiedades',      icon: Building2 },
    { href: '/occupations',    label: 'Ocupaciones',      icon: CalendarCheck },
    { href: '/visits',         label: 'Visitas',          icon: ClipboardList },
    { href: '/damages',        label: 'Daños',            icon: AlertTriangle },
    { href: '/maintenance',    label: 'Mantenimiento',    icon: Wrench },
    { href: '/tickets',        label: 'Tickets',          icon: Receipt },
  ],
  admin: [
    { href: '/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
    { href: '/properties',     label: 'Propiedades',      icon: Building2 },
    { href: '/occupations',    label: 'Ocupaciones',      icon: CalendarCheck },
    { href: '/visits',         label: 'Visitas',          icon: ClipboardList },
    { href: '/damages',        label: 'Daños',            icon: AlertTriangle },
    { href: '/maintenance',    label: 'Mantenimiento',    icon: Wrench },
    { href: '/tickets',        label: 'Tickets',          icon: Receipt },
    { href: '/reports',        label: 'Reportes',         icon: BarChart3 },
    { href: '/users',          label: 'Usuarios / Team',  icon: Users },
    { href: '/backup',         label: 'Exportar datos',   icon: Download },
  ],
  super_admin: [
    { href: '/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
    { href: '/properties',     label: 'Propiedades',      icon: Building2 },
    { href: '/occupations',    label: 'Ocupaciones',      icon: CalendarCheck },
    { href: '/visits',         label: 'Visitas',          icon: ClipboardList },
    { href: '/damages',        label: 'Daños',            icon: AlertTriangle },
    { href: '/maintenance',    label: 'Mantenimiento',    icon: Wrench },
    { href: '/tickets',        label: 'Tickets',          icon: Receipt },
    { href: '/reports',        label: 'Reportes',         icon: BarChart3 },
    { href: '/users',          label: 'Usuarios / Team',  icon: Users },
    { href: '/catalogs',       label: 'Catálogos',        icon: BookOpen },
    { href: '/backup',         label: 'Exportar datos',   icon: Download },
    { href: '/audit',          label: 'Auditoría',        icon: ShieldCheck },
  ],
};

interface MobileNavProps {
  role: UserRole;
  fullName: string;
}

export function MobileNav({ role, fullName }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const items = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.cleaner;

  function isActive(href: string) {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  }

  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-base font-black text-white shadow-sm">
                  B
                </div>
                <div className="flex flex-col">
                  <span className="font-heading text-lg font-bold tracking-tight text-zinc-900">Búho Core</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{ROLE_LABELS[role]}</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                      active
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{fullName}</p>
                  <p className="text-[10px] uppercase font-bold text-primary">{ROLE_LABELS[role]}</p>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-zinc-100 transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
