import Link from 'next/link';
import { BookOpen, Building2, Package, Store, ClipboardList, Tag } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SECTIONS = [
  {
    href: '/catalogs/property-types',
    title: 'Tipos de propiedad',
    description: 'Studio, 1D1B, Casa, Cabaña...',
    icon: Building2
  },
  {
    href: '/catalogs/item-categories',
    title: 'Categorías de ítems',
    description: 'Agrupación de consumibles y esporádicos',
    icon: Tag
  },
  {
    href: '/catalogs/items',
    title: 'Ítems',
    description: 'Consumibles y elementos esporádicos',
    icon: Package
  },
  {
    href: '/catalogs/suppliers',
    title: 'Proveedores',
    description: 'Jumbo, Líder, Sodimac...',
    icon: Store
  },
  {
    href: '/catalogs/visit-types',
    title: 'Tipos de visita',
    description: 'Limpieza entre ocupaciones, mantenimiento...',
    icon: ClipboardList
  }
];

export default async function CatalogsIndex() {
  await requireRole('super_admin');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catálogos</h1>
          <p className="text-sm text-muted-foreground">Datos maestros del sistema</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href}>
              <Card className="transition-colors hover:border-primary">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-accent">
                    <Icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <CardTitle>{s.title}</CardTitle>
                  <CardDescription>{s.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm font-medium text-primary">Gestionar →</CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
