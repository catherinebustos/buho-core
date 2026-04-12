'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export interface PhotoUploaderProps {
  /** Bucket de Supabase Storage */
  bucket: string;
  /** Función que genera el path en el bucket a partir del nombre original */
  buildPath: (filename: string) => string;
  /** Acción del servidor que recibe el storage_path y persiste el registro en DB */
  onUploaded: (storagePath: string) => Promise<void>;
  /** Etiqueta del botón */
  label?: string;
  /** Clases adicionales del contenedor */
  className?: string;
}

export function PhotoUploader({
  bucket,
  buildPath,
  onUploaded,
  label = 'Subir foto',
  className
}: PhotoUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo no puede superar los 10 MB.');
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const supabase = createClient();
      const path = buildPath(file.name);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadError) throw uploadError;

      await onUploaded(path);
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? 'Error al subir la foto');
      setPreview(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {preview ? (
        <div className="relative h-40 w-full overflow-hidden rounded-md border border-dashed border-border">
          <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-dashed border-input px-4 py-2 text-sm',
          'hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors'
        )}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {uploading ? 'Subiendo…' : label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
