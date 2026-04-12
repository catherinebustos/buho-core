'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  href?: string;   // si se pasa, hace Link; si no, router.back()
  label?: string;
  className?: string;
}

export function BackButton({ href, label = 'Volver', className }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm',
        'text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
        'min-h-[44px] min-w-[44px]', // touch target mínimo
        className
      )}
    >
      <ArrowLeft className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
