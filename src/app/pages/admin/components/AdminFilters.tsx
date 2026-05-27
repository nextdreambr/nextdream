import type { ReactNode } from 'react';

import { cn } from '../../../components/ui/utils';

export type AdminFilterType = 'select' | 'text' | 'date';

export interface AdminFilterOption {
  value: string;
  label: string;
}

export interface AdminFilterField {
  id: string;
  label: string;
  value: string;
  type?: AdminFilterType;
  placeholder?: string;
  options?: AdminFilterOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

interface AdminFiltersProps {
  fields?: AdminFilterField[];
  children?: ReactNode;
  className?: string;
}

export function AdminFilters({ fields = [], children, className }: AdminFiltersProps) {
  if (fields.length === 0 && !children) return null;

  return (
    <div className={cn('grid gap-3 md:grid-cols-2 xl:grid-cols-4', className)}>
      {fields.map((field) => (
        <label key={field.id} className="space-y-1 text-sm font-medium text-slate-700">
          <span>{field.label}</span>
          {field.type === 'select' || field.options ? (
            <select
              value={field.value}
              disabled={field.disabled}
              onChange={(event) => field.onChange(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              {(field.options ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type ?? 'text'}
              value={field.value}
              disabled={field.disabled}
              placeholder={field.placeholder}
              onChange={(event) => field.onChange(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            />
          )}
        </label>
      ))}
      {children}
    </div>
  );
}
