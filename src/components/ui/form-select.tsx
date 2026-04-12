'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps {
  name?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}

export function FormSelect({
  name,
  options,
  value: controlledValue,
  defaultValue = '',
  placeholder = 'Selecciona...',
  className,
  onChange,
  required
}: FormSelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {/* Hidden input for native form submission */}
      {name && <input type="hidden" name={name} value={value} required={required && !value} />}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between gap-2 h-14 bg-white rounded-2xl px-5 text-sm font-bold border border-zinc-200 shadow-sm hover:border-primary/50 transition-all outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          !selectedOption ? "text-zinc-400 font-medium" : "text-zinc-800"
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-[calc(100%+0.5rem)] left-0 w-full bg-white rounded-[1.5rem] p-2 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto pr-1">
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
