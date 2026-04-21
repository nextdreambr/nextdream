import { isSandboxEnvironment } from '../config/environment';
import type { SandboxPersona } from './api';

export const SANDBOX_TOUR_STORAGE_KEY = 'nextdream.sandbox.tour';

export type SandboxTourProgress = 'dismissed' | 'completed';

export interface SandboxTourSessionState {
  queuedLaunchPersona: SandboxPersona | null;
  progressByPersona: Partial<Record<SandboxPersona, SandboxTourProgress>>;
}

const SANDBOX_PERSONAS: SandboxPersona[] = ['paciente', 'apoiador', 'instituicao'];
const SANDBOX_TOUR_PROGRESS_VALUES: SandboxTourProgress[] = ['dismissed', 'completed'];

function createDefaultState(): SandboxTourSessionState {
  return {
    queuedLaunchPersona: null,
    progressByPersona: {},
  };
}

function getSandboxTourStorage() {
  if (typeof window === 'undefined') return null;
  if (!isSandboxEnvironment()) return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function isSandboxPersona(value: unknown): value is SandboxPersona {
  return typeof value === 'string' && SANDBOX_PERSONAS.includes(value as SandboxPersona);
}

function isSandboxTourProgress(value: unknown): value is SandboxTourProgress {
  return typeof value === 'string' && SANDBOX_TOUR_PROGRESS_VALUES.includes(value as SandboxTourProgress);
}

function sanitizeProgressByPersona(
  raw: unknown,
): Partial<Record<SandboxPersona, SandboxTourProgress>> {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const sanitized: Partial<Record<SandboxPersona, SandboxTourProgress>> = {};
  for (const [persona, progress] of Object.entries(raw)) {
    if (isSandboxPersona(persona) && isSandboxTourProgress(progress)) {
      sanitized[persona] = progress;
    }
  }

  return sanitized;
}

export function loadSandboxTourState(): SandboxTourSessionState {
  const storage = getSandboxTourStorage();
  if (!storage) return createDefaultState();

  try {
    const raw = storage.getItem(SANDBOX_TOUR_STORAGE_KEY);
    if (!raw) return createDefaultState();

    const parsed = JSON.parse(raw) as Partial<SandboxTourSessionState>;
    return {
      queuedLaunchPersona: isSandboxPersona(parsed.queuedLaunchPersona)
        ? parsed.queuedLaunchPersona
        : null,
      progressByPersona: sanitizeProgressByPersona(parsed.progressByPersona),
    };
  } catch {
    return createDefaultState();
  }
}

export function saveSandboxTourState(nextState: SandboxTourSessionState) {
  const storage = getSandboxTourStorage();
  if (!storage) return;
  try {
    storage.setItem(SANDBOX_TOUR_STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    return;
  }
}

export function queueSandboxTourLaunch(persona: SandboxPersona) {
  const current = loadSandboxTourState();
  saveSandboxTourState({
    ...current,
    queuedLaunchPersona: persona,
  });
}

export function clearSandboxTourLaunch() {
  const current = loadSandboxTourState();
  saveSandboxTourState({
    ...current,
    queuedLaunchPersona: null,
  });
}

export function consumeSandboxTourLaunch(expectedPersona: SandboxPersona) {
  const current = loadSandboxTourState();
  if (current.queuedLaunchPersona !== expectedPersona) {
    return null;
  }

  saveSandboxTourState({
    ...current,
    queuedLaunchPersona: null,
  });

  return expectedPersona;
}

export function setSandboxTourProgress(persona: SandboxPersona, progress: SandboxTourProgress) {
  const current = loadSandboxTourState();
  saveSandboxTourState({
    ...current,
    progressByPersona: {
      ...current.progressByPersona,
      [persona]: progress,
    },
  });
}
