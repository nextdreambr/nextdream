import type { ReactNode } from 'react';

import { cn } from '../../../components/ui/utils';
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from './AdminStates';

export interface AdminDataTableColumn<T> {
  id: string;
  header: ReactNode;
  render: (item: T) => ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

interface AdminDataTableProps<T> {
  rows: T[];
  columns: AdminDataTableColumn<T>[];
  getRowId: (item: T) => string;
  selectedRowId?: string | null;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  error?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
}

const alignClasses: Record<NonNullable<AdminDataTableColumn<unknown>['align']>, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

export function AdminDataTable<T,>({
  rows,
  columns,
  getRowId,
  selectedRowId,
  onRowClick,
  loading = false,
  error,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription = 'Ajuste a busca ou os filtros para ampliar a lista.',
  onRetry,
}: AdminDataTableProps<T>) {
  if (loading) {
    return <AdminLoadingState title="Carregando registros" description="Buscando dados administrativos." />;
  }

  if (error) {
    return <AdminErrorState title="Não foi possível carregar" description={error} actionLabel={onRetry ? 'Tentar novamente' : undefined} onAction={onRetry} />;
  }

  if (rows.length === 0) {
    return <AdminEmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {columns.map((column) => (
              <th key={column.id} className={cn('px-4 py-3 font-semibold', alignClasses[column.align ?? 'left'], column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowId = getRowId(row);
            const selected = selectedRowId === rowId;
            return (
              <tr
                key={rowId}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-t border-slate-100 transition',
                  onRowClick && 'cursor-pointer hover:bg-pink-50/50',
                  selected && 'bg-pink-50',
                )}
              >
                {columns.map((column) => (
                  <td key={column.id} className={cn('px-4 py-3 text-slate-700', alignClasses[column.align ?? 'left'], column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
