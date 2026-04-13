'use client';

import { useMemo, useState } from 'react';
import { Trash2, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/form-select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCLP } from '@/lib/utils';
import type { Tables } from '@/lib/types/database.generated';
type Item = Tables<'items'> & { units_per_package?: number };
type Property = Tables<'properties'>;
type Supplier = Tables<'suppliers'>;

interface Line {
  key: string;
  item_id: string;
  quantity: string;
  unit_price: string;
  notes: string;
}

function newLine(): Line {
  return {
    key: Math.random().toString(36).slice(2, 10),
    item_id: '',
    quantity: '1',
    unit_price: '0',
    notes: ''
  };
}

interface TicketFormProps {
  action: (formData: FormData) => void | Promise<void>;
  suppliers: Supplier[];
  items: Item[];
  properties: Pick<Property, 'id' | 'nickname'>[];
  error?: string;
  defaultValues?: {
    ticket_number?: string;
    purchase_date?: string;
    supplier_id?: string;
    property_id?: string;
    notes?: string;
    lines?: Line[];
  };
  submitLabel?: string;
  /** Campos ocultos adicionales que se inyectan en el form (ej: id para edición) */
  hiddenFields?: Record<string, string>;
}

export function TicketForm({
  action,
  suppliers,
  items,
  properties,
  error,
  defaultValues,
  submitLabel = 'Crear ticket',
  hiddenFields
}: TicketFormProps) {
  const [lines, setLines] = useState<Line[]>(defaultValues?.lines ?? [newLine()]);

  const total = useMemo(
    () =>
      lines.reduce(
        (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0),
        0
      ),
    [lines]
  );

  const serializedLines = useMemo(
    () =>
      JSON.stringify(
        lines
          .filter((l) => l.item_id && Number(l.quantity) > 0)
          .map((l) => ({
            item_id: l.item_id,
            quantity: Number(l.quantity),
            unit_price: Number(l.unit_price),
            notes: l.notes || null
          }))
      ),
    [lines]
  );

  const update = (key: string, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const remove = (key: string) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));

  const getItem = (id: string) => items.find((i) => i.id === id);

  return (
    <form action={action} className="space-y-6">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <input type="hidden" name="lines" value={serializedLines} />
      {hiddenFields &&
        Object.entries(hiddenFields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}

      {/* ── Datos del ticket ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ticket_number">N° ticket *</Label>
              <Input
                id="ticket_number"
                name="ticket_number"
                required
                defaultValue={defaultValues?.ticket_number}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Fecha de compra *</Label>
              <Input
                id="purchase_date"
                name="purchase_date"
                type="date"
                defaultValue={
                  defaultValues?.purchase_date ?? new Date().toISOString().slice(0, 10)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Proveedor *</Label>
              <FormSelect
                name="supplier_id"
                required
                defaultValue={defaultValues?.supplier_id}
                options={suppliers.map((s) => ({ label: s.name, value: s.id }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="property_id">Propiedad asociada</Label>
              <FormSelect
                name="property_id"
                placeholder="Gasto general (sin propiedad)"
                defaultValue={defaultValues?.property_id ?? ''}
                options={[
                  { label: 'Gasto general (sin propiedad)', value: '' },
                  ...properties.map((p) => ({ label: p.nickname, value: p.id }))
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={1}
                className="resize-none"
                defaultValue={defaultValues?.notes}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Ítems comprados ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Ítems comprados</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLines((prev) => [...prev, newLine()])}
          >
            <Plus className="h-4 w-4" />
            Agregar ítem
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Cabeceras de columna — solo desktop */}
          <div className="hidden grid-cols-12 gap-2 px-1 text-xs font-medium text-muted-foreground md:grid">
            <div className="col-span-5">Ítem</div>
            <div className="col-span-2 text-center">Cantidad</div>
            <div className="col-span-2 text-right">Precio unit.</div>
            <div className="col-span-2 text-right">Subtotal</div>
            <div className="col-span-1" />
          </div>

          {lines.map((line) => {
            const item = getItem(line.item_id);
            const uPkg: number = item ? ((item as any).units_per_package ?? 1) : 1;
            const qty = Number(line.quantity) || 0;
            const lineTotal = qty * (Number(line.unit_price) || 0);
            const totalUnits = qty * uPkg;

            return (
              <div
                key={line.key}
                className="grid grid-cols-12 items-start gap-2 rounded-md border border-border bg-muted/20 p-2"
              >
                {/* Ítem + info de contenido + notas */}
                <div className="col-span-12 md:col-span-5">
                  <Label className="mb-1 block text-xs md:hidden">Ítem</Label>
                  <FormSelect
                    value={line.item_id}
                    onChange={(val) => update(line.key, { item_id: val })}
                    placeholder="— Selecciona ítem —"
                    options={items.map((i) => ({ label: i.name, value: i.id }))}
                  />
                  {item && uPkg > 1 && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <Package className="h-3 w-3 shrink-0" />
                      <span>
                        {uPkg} {item.unit ?? 'unidades'}/unidad comprada
                        {qty > 0 && (
                          <>
                            {' '}· total:{' '}
                            <strong>
                              {totalUnits} {item.unit ?? 'unidades'}
                            </strong>
                          </>
                        )}
                      </span>
                    </div>
                  )}
                  <Input
                    className="mt-1.5 h-7 text-xs placeholder:text-muted-foreground/60"
                    placeholder="Nota de línea (opcional)"
                    value={line.notes}
                    onChange={(e) => update(line.key, { notes: e.target.value })}
                  />
                </div>

                {/* Cantidad */}
                <div className="col-span-4 md:col-span-2">
                  <Label className="mb-1 block text-xs md:hidden">Cant.</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={line.quantity}
                    onChange={(e) => update(line.key, { quantity: e.target.value })}
                    className="text-center"
                  />
                  {item && (
                    <div className="mt-0.5 text-center text-xs text-muted-foreground">
                      {item.unit ?? 'unidad'}
                    </div>
                  )}
                </div>

                {/* Precio unitario */}
                <div className="col-span-4 md:col-span-2">
                  <Label className="mb-1 block text-xs md:hidden">Precio unit.</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={line.unit_price}
                    onChange={(e) => update(line.key, { unit_price: e.target.value })}
                    className="text-right"
                  />
                </div>

                {/* Subtotal */}
                <div className="col-span-3 md:col-span-2">
                  <Label className="mb-1 block text-xs md:hidden">Subtotal</Label>
                  <div className="flex h-10 items-center justify-end rounded-md border border-dashed border-border px-2 text-sm font-medium tabular-nums">
                    {formatCLP(lineTotal)}
                  </div>
                </div>

                {/* Eliminar */}
                <div className="col-span-1 flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(line.key)}
                    disabled={lines.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Total del ticket:</span>
            <span className="text-2xl font-bold tabular-nums">{formatCLP(total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <a href="/tickets">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </a>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
