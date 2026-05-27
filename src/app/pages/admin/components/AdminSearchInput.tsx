import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '../../../components/ui/utils';

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
  clearLabel?: string;
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder = 'Buscar',
  label = 'Busca',
  debounceMs = 0,
  disabled = false,
  className,
  clearLabel = 'Limpar busca',
}: AdminSearchInputProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (debounceMs <= 0 || draft === value) return undefined;

    const timeout = window.setTimeout(() => {
      onChange(draft);
    }, debounceMs);

    return () => window.clearTimeout(timeout);
  }, [debounceMs, draft, onChange, value]);

  function updateValue(nextValue: string) {
    setDraft(nextValue);
    if (debounceMs <= 0) {
      onChange(nextValue);
    }
  }

  function clear() {
    setDraft('');
    onChange('');
  }

  return (
    <label className={cn('block text-sm font-medium text-slate-700', className)}>
      <span className="sr-only">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100">
        <Search className="size-4 text-slate-400" />
        <input
          type="search"
          value={draft}
          onChange={(event) => updateValue(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
        />
        {draft && !disabled && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={clear}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-4" />
          </button>
        )}
      </span>
    </label>
  );
}
