'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.cleaner;

  return (
    <nav className="flex flex-col gap-1">
      <div className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase px-4 mb-2 mt-4 font-heading">Menu</div>
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 font-heading',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", active ? "text-primary drop-shadow-sm" : "")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
