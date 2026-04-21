import { isSandboxEnvironment } from '../config/environment';
import type { SandboxPersona } from './api';

export const SANDBOX_TOUR_STORAGE_KEY = 'nextdream.sandbox.tour';

export type SandboxTourProgress = 'dismissed' | 'completed';

export interface SandboxTourSessionState {
  queuedLaunchPersona: SandboxPersona | null;
  progressByPersona: Partial<Record<SandboxPersona, SandboxTourProgress>>;
}

const defaultState: SandboxTourSessionState = {
  queuedLaunchPersona: null,
  progressByPersona: {},
};

function getSandboxTourStorage() {
  if (typeof window === 'undefined') return null;
  if (!isSandboxEnvironment()) return null;
  return window.sessionStorage;
}

export function loadSandboxTourState(): SandboxTourSessionState {
  const storage = getSandboxTourStorage();
  if (!storage) return defaultState;

  try {
    const raw = storage.getItem(SANDBOX_TOUR_STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw) as Partial<SandboxTourSessionState>;
    return {
      queuedLaunchPersona: parsed.queuedLaunchPersona ?? null,
      progressByPersona: parsed.progressByPersona ?? {},
    };
  } catch {
    return defaultState;
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
