import type { AppRole } from '../context/AppContext';

export const SANDBOX_PROFILE_STORAGE_PREFIX = 'nextdream.sandbox.profile.';
export const SANDBOX_HISTORY_FILTERS = [
  'todos',
  'sonhos',
  'propostas',
  'conversas',
  'notificacoes',
  'visitas',
] as const;

export type SandboxHistoryFilter = (typeof SANDBOX_HISTORY_FILTERS)[number];

export interface SandboxVisitedDream {
  dreamId: string;
  title: string;
  path: string;
  visitedAt: string;
}

export interface SandboxProfileState {
  privacy: {
    showCity: boolean;
    showDreamContext: boolean;
    highlightSafetyReminder: boolean;
  };
  security: {
    demoPasswordDraft: string;
    lastSavedAt?: string;
    safetyChecklist: boolean;
  };
  historyFilter: SandboxHistoryFilter;
  visitedDreams: SandboxVisitedDream[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isSandboxVisitedDream(value: unknown): value is SandboxVisitedDream {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SandboxVisitedDream>;
  return (
    typeof candidate.dreamId === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.path === 'string' &&
    typeof candidate.visitedAt === 'string'
  );
}

function normalizePrivacy(
  value: unknown,
): Partial<SandboxProfileState['privacy']> {
  if (!isRecord(value)) return {};

  return {
    ...(typeof value.showCity === 'boolean' ? { showCity: value.showCity } : {}),
    ...(typeof value.showDreamContext === 'boolean'
      ? { showDreamContext: value.showDreamContext }
      : {}),
    ...(typeof value.highlightSafetyReminder === 'boolean'
      ? { highlightSafetyReminder: value.highlightSafetyReminder }
      : {}),
  };
}

function normalizeSecurity(
  value: unknown,
): Partial<SandboxProfileState['security']> {
  if (!isRecord(value)) return {};

  return {
    ...(typeof value.demoPasswordDraft === 'string'
      ? { demoPasswordDraft: value.demoPasswordDraft }
      : {}),
    ...(typeof value.lastSavedAt === 'string'
      ? { lastSavedAt: value.lastSavedAt }
      : {}),
    ...(typeof value.safetyChecklist === 'boolean'
      ? { safetyChecklist: value.safetyChecklist }
      : {}),
  };
}

function buildDefaultState(role: AppRole): SandboxProfileState {
  return {
    privacy: {
      showCity: true,
      showDreamContext: role !== 'apoiador',
      highlightSafetyReminder: true,
    },
    security: {
      demoPasswordDraft: '',
      safetyChecklist: role !== 'paciente',
      lastSavedAt: undefined,
    },
    historyFilter: 'todos',
    visitedDreams: [],
  };
}

function getStorage(userId: string) {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(`${SANDBOX_PROFILE_STORAGE_PREFIX}${userId}`);
  } catch {
    return null;
  }
}

function saveStorage(userId: string, value: SandboxProfileState) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(`${SANDBOX_PROFILE_STORAGE_PREFIX}${userId}`, JSON.stringify(value));
  } catch {
    // Mantém o sandbox funcional mesmo sem persistência disponível.
  }
}

export function loadSandboxProfileState(userId: string, role: AppRole): SandboxProfileState {
  const fallback = buildDefaultState(role);
  const raw = getStorage(userId);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw) as Partial<SandboxProfileState>;
    const privacy = normalizePrivacy(parsed.privacy);
    const security = normalizeSecurity(parsed.security);
    const historyFilter =
      typeof parsed.historyFilter === 'string' &&
      SANDBOX_HISTORY_FILTERS.includes(parsed.historyFilter as SandboxHistoryFilter)
        ? parsed.historyFilter
        : fallback.historyFilter;
    const visitedDreams = Array.isArray(parsed.visitedDreams)
      ? parsed.visitedDreams.filter(isSandboxVisitedDream)
      : fallback.visitedDreams;

    return {
      privacy: {
        ...fallback.privacy,
        ...privacy,
      },
      security: {
        ...fallback.security,
        ...security,
      },
      historyFilter,
      visitedDreams,
    };
  } catch {
    return fallback;
  }
}

export function persistSandboxProfileState(userId: string, value: SandboxProfileState) {
  saveStorage(userId, value);
}

export function recordSandboxDreamVisit(
  userId: string,
  role: AppRole,
  dream: { dreamId: string; title: string; path: string; visitedAt?: string },
) {
  const current = loadSandboxProfileState(userId, role);
  const nextVisitedDreams = [
    {
      dreamId: dream.dreamId,
      title: dream.title,
      path: dream.path,
      visitedAt: dream.visitedAt ?? new Date().toISOString(),
    },
    ...current.visitedDreams.filter((item) => item.dreamId !== dream.dreamId),
  ].slice(0, 12);

  persistSandboxProfileState(userId, {
    ...current,
    visitedDreams: nextVisitedDreams,
  });
}
