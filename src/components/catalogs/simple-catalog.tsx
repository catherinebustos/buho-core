import { Trash2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';

interface SimpleRow {
  id: string;
  name: string;
  active: boolean;
}

interface SimpleCatalogProps<T extends SimpleRow> {
  title: string;
  description?: string;
  rows: T[];
  createAction: (formData: FormData) => Promise<void>;
  toggleAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  children?: React.ReactNode;
  renderExtraCells?: (row: T) => React.ReactNode;
  extraColumns?: { key: string; label: string }[];
}

export function SimpleCatalog<T extends SimpleRow>({
  title,
  description,
  rows,
  createAction,
  toggleAction,
  deleteAction,
  children,
  renderExtraCells,
  extraColumns = []
}: SimpleCatalogProps<T>) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agregar</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="flex flex-wrap items-end gap-3">
            <div className="min-w-64 flex-1 space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required />
            </div>
            {children}
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <EmptyState title="Sin registros" description="Agrega el primero con el formulario de arriba." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                {extraColumns.map((c) => (
                  <TableHead key={c.key}>{c.label}</TableHead>
                ))}
                <TableHead>Estado</TableHead>
                <TableHead className="w-40 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  {renderExtraCells ? renderExtraCells(row) : null}
                  <TableCell>
                    <Badge variant={row.active ? 'success' : 'secondary'}>
                      {row.active ? 'activo' : 'inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={toggleAction} className="inline">
                      <input type="hidden" name="id" value={row.id} />
                      <input type="hidden" name="active" value={row.active ? '1' : '0'} />
                      <Button type="submit" variant="ghost" size="sm" title="Activar/Desactivar">
                        {row.active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </Button>
                    </form>
                    <form action={deleteAction} className="inline">
                      <input type="hidden" name="id" value={row.id} />
                      <Button type="submit" variant="ghost" size="sm" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
