'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface Option {
  label: string;
  value: string;
}

interface FilterSelectProps {
  name: string;
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export function FilterSelect({
  name,
  options,
  defaultValue = '',
  placeholder = 'Seleccionar...',
  className
}: FilterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue);
  
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  // We can automatically submit the form logic if we want, but since it's a generic component 
  // embedded inside a <form>, we'll rely on a hidden input. Wait, updating a hidden input won't 
  // trigger standard <form onChange>. Let's just push to router if it's purely for filtering.
  const handleSelect = (newValue: string) => {
    setValue(newValue);
    setIsOpen(false);
    
    // Auto-submit logic by pushing to URL
    const params = new URLSearchParams(searchParams.toString());
    if (newValue) {
      params.set(name, newValue);
    } else {
      params.delete(name);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={cn('relative min-w-[160px]', className)} ref={containerRef}>
      {/* Hidden input to maintain native form compatibility if needed */}
      <input type="hidden" name={name} value={value} />
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 h-14 bg-white rounded-2xl px-5 text-sm font-bold text-zinc-700 hover:text-zinc-900 border-none shadow-sm hover:shadow-md transition-all outline-none focus:ring-2 focus:ring-primary"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+0.5rem)] left-0 w-full bg-white rounded-[1.5rem] p-2 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto">
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3 text-sm font-bold rounded-xl transition-all",
                    isSelected 
                      ? "bg-primary text-white" 
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
