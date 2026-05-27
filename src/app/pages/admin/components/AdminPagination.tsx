import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
}

export function AdminPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
  disabled = false,
}: AdminPaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(safePage * pageSize, total);
  const previousDisabled = disabled || safePage <= 1;
  const nextDisabled = disabled || safePage >= safeTotalPages;

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm font-medium text-slate-600">
        {total === 0 ? 'Exibindo 0 de 0' : `Exibindo ${start}–${end} de ${total}`}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span>Itens por página</span>
          <select
            aria-label="Itens por página"
            value={pageSize}
            disabled={disabled}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={previousDisabled}
            onClick={() => onPageChange(safePage - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft className="size-4" />
            Anterior
          </button>
          <span className="text-sm text-slate-500">
            Página {safePage} de {safeTotalPages}
          </span>
          <button
            type="button"
            aria-label="Próxima página"
            disabled={nextDisabled}
            onClick={() => onPageChange(safePage + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Próxima
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
