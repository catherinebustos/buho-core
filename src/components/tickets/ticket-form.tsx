'use client';

import { useMemo, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/form-select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCLP } from '@/lib/utils';
import type { Tables } from '@/lib/types/database.generated';
type Item = Tables<'items'>;
type Property = Tables<'properties'>;
type Supplier = Tables<'suppliers'>;

interface Line {
  key: string;
  item_id: string;
  property_id: string;
  quantity: string;
  unit_price: string;
  notes: string;
}

function newLine(): Line {
  return {
    key: Math.random().toString(36).slice(2, 10),
    item_id: '',
    property_id: '',
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
}

export function TicketForm({ action, suppliers, items, properties, error }: TicketFormProps) {
  const [lines, setLines] = useState<Line[]>([newLine()]);

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
            property_id: l.property_id || null,
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

  return (
    <form action={action} className="space-y-6">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <input type="hidden" name="lines" value={serializedLines} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ticket_number">Número de ticket *</Label>
              <Input id="ticket_number" name="ticket_number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Fecha de compra *</Label>
              <Input
                id="purchase_date"
                name="purchase_date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="supplier_id">Proveedor *</Label>
              <FormSelect
                name="supplier_id"
                required
                options={suppliers.map(s => ({ label: s.name, value: s.id }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Líneas del ticket</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLines((prev) => [...prev, newLine()])}
          >
            <Plus className="h-4 w-4" />
            Agregar línea
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {lines.map((line) => {
            const lineTotal = (Number(line.quantity) || 0) * (Number(line.unit_price) || 0);
            return (
              <div
                key={line.key}
                className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-12"
              >
                <div className="space-y-1 md:col-span-4">
                  <Label className="text-xs">Ítem</Label>
                  <FormSelect
                    value={line.item_id}
                    onChange={(val) => update(line.key, { item_id: val })}
                    options={items.map(i => ({ label: i.name, value: i.id }))}
                  />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <Label className="text-xs">Propiedad (opcional)</Label>
                  <FormSelect
                    value={line.property_id}
                    onChange={(val) => update(line.key, { property_id: val })}
                    placeholder="Gasto general"
                    options={[
                      { label: 'Gasto general', value: '' },
                      ...properties.map(p => ({ label: p.nickname, value: p.id }))
                    ]}
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <Label className="text-xs">Cant.</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.quantity}
                    onChange={(e) => update(line.key, { quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">Precio unit.</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unit_price}
                    onChange={(e) => update(line.key, { unit_price: e.target.value })}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">Subtotal</Label>
                  <div className="flex h-10 items-center justify-end rounded-md border border-dashed border-border px-3 text-sm tabular-nums">
                    {formatCLP(lineTotal)}
                  </div>
                </div>
                <div className="flex items-end md:col-span-12 md:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(line.key)}
                    disabled={lines.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                    Quitar línea
                  </Button>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total:</span>
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
        <Button type="submit">Crear ticket</Button>
      </div>
    </form>
  );
}
