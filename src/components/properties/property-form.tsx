import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, X } from 'lucide-react';
import type { Property, PropertyType } from '@/lib/types/database.generated';

interface PropertyFormProps {
  property?: Partial<Property>;
  propertyTypes: PropertyType[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  cancelHref: string;
  error?: string;
}

export function PropertyForm({
  property,
  propertyTypes,
  action,
  submitLabel,
  cancelHref,
  error
}: PropertyFormProps) {
  // Clases compartidas para el diseño "Burbuja Absolute Clean"
  const inputElClasses = "h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 px-4 text-base focus-visible:ring-primary focus-visible:bg-white transition-all shadow-sm";
  const labelClasses = "text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 ml-1 block";

  return (
    <form action={action} className="space-y-8">
      {error ? (
        <Alert variant="destructive" className="rounded-2xl bg-red-50 text-red-600 border-red-200">
          <AlertDescription className="font-bold">{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1 relative group">
          <Label htmlFor="nickname" className={labelClasses}>Nickname Operativo *</Label>
          <Input
            id="nickname"
            name="nickname"
            defaultValue={property?.nickname}
            placeholder="Ej: LFL URBART 1D 1B 1013"
            required
            className={`${inputElClasses} font-mono`}
          />
          <p className="text-[11px] font-medium text-zinc-400 ml-2 mt-1">
            Formato: CÓDIGO_EDIFICIO TIPO_UNIDAD N-D N-B Id
          </p>
        </div>

        <div className="space-y-1 relative group">
          <Label htmlFor="title" className={labelClasses}>Título Comercial Airbnb *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={property?.title}
            placeholder="Modern Apartment w/ Pool..."
            required
            className={inputElClasses}
          />
        </div>

        <div className="space-y-1 relative group">
          <Label htmlFor="property_type_id" className={labelClasses}>Tipología</Label>
          <select 
            id="property_type_id" 
            name="property_type_id" 
            defaultValue={property?.property_type_id ?? ''}
            className={`w-full appearance-none cursor-pointer border focus:outline-none ${inputElClasses}`}
          >
            <option value="">— Seleccionar —</option>
            {propertyTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1 relative group">
          <Label htmlFor="status" className={labelClasses}>Status Operativo</Label>
          <select 
            id="status" 
            name="status" 
            defaultValue={property?.status ?? 'activa'}
            className={`w-full appearance-none cursor-pointer border focus:outline-none ${inputElClasses}`}
          >
            <option value="activa">Unidad Activa</option>
            <option value="inactiva">En Pausa / Inactiva</option>
          </select>
        </div>

        <div className="space-y-1 relative group md:col-span-2 grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="city" className={labelClasses}>Ciudad *</Label>
              <Input id="city" name="city" defaultValue={property?.city} placeholder="Santiago" required className={inputElClasses} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="country" className={labelClasses}>País</Label>
              <Input id="country" name="country" defaultValue={property?.country ?? 'Chile'} className={inputElClasses} />
            </div>
        </div>

        <div className="space-y-1 relative group md:col-span-2">
          <Label htmlFor="address" className={labelClasses}>Dirección Exacta</Label>
          <Input id="address" name="address" defaultValue={property?.address ?? ''} className={inputElClasses} />
        </div>

        <div className="space-y-1 relative group">
          <Label htmlFor="area_m2" className={labelClasses}>Metraje (m²)</Label>
          <Input
            id="area_m2"
            name="area_m2"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            defaultValue={property?.area_m2 ?? ''}
            className={inputElClasses}
          />
        </div>

        <div className="space-y-1 relative group">
          <Label htmlFor="guest_capacity" className={labelClasses}>Capacidad Huéspedes (PAX)</Label>
          <Input
            id="guest_capacity"
            name="guest_capacity"
            type="number"
            min="0"
            placeholder="0"
            defaultValue={property?.guest_capacity ?? ''}
            className={inputElClasses}
          />
        </div>

        <div className="space-y-1 relative group md:col-span-2">
          <Label htmlFor="notes" className={labelClasses}>Manifiesto Operativo (Notas Visibles para Limpieza)</Label>
          <Textarea 
            id="notes" 
            name="notes" 
            defaultValue={property?.notes ?? ''} 
            className="min-h-[120px] rounded-2xl border-zinc-200 bg-zinc-50/50 p-4 text-base focus-visible:ring-primary focus-visible:bg-white transition-all shadow-sm resize-y"
            placeholder="Instrucciones del código de acceso, peculiaridades de la cocina..."
          />
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 pt-6 border-t border-zinc-100">
        <a href={cancelHref} className="w-full md:w-auto">
          <Button type="button" variant="outline" className="w-full md:w-auto h-14 px-8 rounded-2xl font-bold bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 transition-all">
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </a>
        <Button type="submit" className="w-full md:w-auto h-14 px-10 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-primary transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5">
          {submitLabel}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
