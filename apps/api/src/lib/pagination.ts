export interface PaginationInput {
  page?: string | number;
  pageSize?: string | number;
}

export interface PaginationState {
  enabled: boolean;
  page: number;
  pageSize: number;
  skip: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function toPositiveInteger(value: string | number | undefined, fallback: number) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function parsePagination(input: PaginationInput): PaginationState {
  const enabled = input.page !== undefined || input.pageSize !== undefined;
  const page = toPositiveInteger(input.page, DEFAULT_PAGE);
  const pageSize = Math.min(
    toPositiveInteger(input.pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );

  return {
    enabled,
    page,
    pageSize,
    skip: (page - 1) * pageSize,
  };
}

export function hasQueryFilters(filters: Record<string, unknown>) {
  return Object.values(filters).some((value) => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  });
}

export function normalizeQueryTerm(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildPaginatedResult<T>(items: T[], page: number, pageSize: number, total: number) {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
